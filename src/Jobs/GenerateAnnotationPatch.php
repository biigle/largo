<?php

namespace Biigle\Modules\Largo\Jobs;

use File;
use Exception;
use VipsImage;
use ImageCache;
use Biigle\Image;
use Biigle\Shape;
use Biigle\Jobs\Job;
use Biigle\Annotation;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class GenerateAnnotationPatch extends Job implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The ID of the annotation to generate a patch for.
     *
     * @var int
     */
    protected $id;

    /**
     * The annotation that is set when the job is processed.
     *
     * @var Annotation
     */
    protected $annotation;

    /**
     * Create a new job instance.
     *
     * @param Annotation $annotation
     *
     * @return void
     */
    public function __construct(Annotation $annotation)
    {
        // Take only the ID and not the annotation because the annotation may already be
        // deleted when this job runs and the job would fail!
        $this->id = $annotation->id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->annotation = Annotation::with('image.volume')->find($this->id);
        // Annotation may have been deleted in the meantime.
        if ($this->annotation === null) {
            return;
        }

        try {
            ImageCache::get($this->annotation->image, [$this, 'handleImage']);
        } catch (Exception $e) {
            if ($e->getMessage() === 'The source resource could not be established.' && $this->attempts() < 3) {
                // Retry in 10 minutes, maybe the remote source is available again.
                $this->release(600);

                return;
            }

            throw new Exception("Could not generate annotation patch for annotation {$this->id}: {$e->getMessage()}");
        }
    }

    /**
     * Handle a single image.
     *
     * @param Image $image
     * @param string $path Path to the cached image file.
     */
    public function handleImage(Image $image, $path)
    {
        $prefix = config('largo.patch_storage').'/'.$image->volume_id;
        if (!File::exists($prefix)) {
            // Make recursive. With force to ignore errors due to race conditions.
            // see: https://github.com/biigle/largo/issues/47
            File::makeDirectory($prefix, 0755, true, true);
        }

        $format = config('largo.patch_format');
        $thumbWidth = config('thumbnails.width');
        $thumbHeight = config('thumbnails.height');

        $rect = $this->getPatchRect($this->annotation, $thumbWidth, $thumbHeight);

        $image = $this->getVipsImage($path);
        $rect = $this->makeRectContained($rect, $image);

        $image->crop($rect['left'], $rect['top'], $rect['width'], $rect['height'])
            ->resize(floatval($thumbWidth) / $rect['width'])
            ->writeToFile("{$prefix}/{$this->id}.{$format}");
    }

    /**
     * Get the vips image instance.
     *
     * @param string $path
     *
     * @return \Jcupitt\Vips\Image
     */
    protected function getVipsImage($path)
    {
        return VipsImage::newFromFile($path, ['access' => 'sequential']);
    }

    /**
     * Calculate the bounding rectangle of the patch to extract.
     *
     * @param Annotation $annotation
     * @param int $thumbWidth
     * @param int $thumbHeight
     *
     * @return array Containing width, height, top and left
     */
    protected function getPatchRect(Annotation $annotation, $thumbWidth, $thumbHeight)
    {
        $padding = config('largo.patch_padding');
        $points = $annotation->points;

        switch ($annotation->shape_id) {
            case Shape::$pointId:
                $pointPadding = config('largo.point_padding');
                $left = $points[0] - $pointPadding;
                $right = $points[0] + $pointPadding;
                $top = $points[1] - $pointPadding;
                $bottom = $points[1] + $pointPadding;
                break;

            case Shape::$circleId:
                $left = $points[0] - $points[2];
                $right = $points[0] + $points[2];
                $top = $points[1] - $points[2];
                $bottom = $points[1] + $points[2];
                break;

            default:
                $left = INF;
                $right = -INF;
                $top = INF;
                $bottom = -INF;
                foreach ($points as $index => $value) {
                    if ($index % 2 === 0) {
                        $left = min($left, $value);
                        $right = max($right, $value);
                    } else {
                        $top = min($top, $value);
                        $bottom = max($bottom, $value);
                    }
                }
        }

        $left -= $padding;
        $right += $padding;
        $top -= $padding;
        $bottom += $padding;

        $width = $right - $left;
        $height = $bottom - $top;

        $widthRatio = $width / $thumbWidth;
        $heightRatio = $height / $thumbHeight;

        // increase the size of the patch so its aspect ratio is the same than the
        // ratio of the thumbnail dimensions
        if ($widthRatio > $heightRatio) {
            $newHeight = round($thumbHeight * $widthRatio);
            $top -= round(($newHeight - $height) / 2);
            $height = $newHeight;
        } else {
            $newWidth = round($thumbWidth * $heightRatio);
            $left -= round(($newWidth - $width) / 2);
            $width = $newWidth;
        }

        return [
            'width' => intval(round($width)),
            'height' => intval(round($height)),
            'left' => intval(round($left)),
            'top' => intval(round($top)),
        ];
    }

    /**
     * Adjust the position and size of the patch rectangle so it is contained in the
     * image.
     *
     * @param array $rect
     * @param Jcupitt\Vips\Image $image
     *
     * @return array
     */
    protected function makeRectContained($rect, $image)
    {
        // Order of min max is importans so the point gets no negative coordinates.
        $rect['left'] = min($image->width - $rect['width'], $rect['left']);
        $rect['left'] = max(0, $rect['left']);
        $rect['top'] = min($image->height - $rect['height'], $rect['top']);
        $rect['top'] = max(0, $rect['top']);

        // Adjust dimensions of rect if it is larger than the image.
        $rect['width'] = min($image->width, $rect['width']);
        $rect['height'] = min($image->height, $rect['height']);

        return $rect;
    }
}
