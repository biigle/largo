<?php

namespace Biigle\Tests\Modules\Largo\Jobs;

use File;
use Mockery;
use Storage;
use TestCase;
use Biigle\Shape;
use Biigle\Annotation;
use Biigle\Tests\AnnotationTest;
use Biigle\Modules\Largo\Jobs\GenerateAnnotationPatch;

class GenerateAnnotationPatchTest extends TestCase
{
    public function testHandleSerialization()
    {
        $this->getImageMock(0);
        $annotation = AnnotationTest::create();
        $job = serialize(new GenerateAnnotationPatchStub($annotation, 'test'));
        $annotation->delete();
        $job = unserialize($job);
        // This should throw no error and should not perform any processing.
        $job->handle();
    }

    public function testHandleStorage()
    {
        Storage::fake('test');
        $image = $this->getImageMock();
        $annotation = AnnotationTest::create();
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->once()
            ->andReturn($image);
        $image->shouldReceive('writeToBuffer')
            ->with('.jpg', ['Q' => 85])
            ->once()
            ->andReturn('abc123');

        $job->handleImage($annotation->image, 'abc');
        $prefix = fragment_uuid_path($annotation->image->uuid);
        $content = Storage::disk('test')->get("{$prefix}/{$annotation->id}.jpg");
        $this->assertEquals('abc123', $content);
    }

    public function testHandlePoint()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $annotation = AnnotationTest::create([
            'points' => [100, 100],
            'shape_id' => Shape::pointId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->with(26, 26, 148, 148)
            ->once()
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    public function testHandleCircle()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $annotation = AnnotationTest::create([
            // Should handle floats correctly.
            // Make the circle large enough so the crop is not affected by the minimum
            // dimension.
            'points' => [300.4, 300.4, 200],
            'shape_id' => Shape::circleId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->with(90, 90, 420, 420)
            ->once()
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    public function testHandleOther()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $padding = config('largo.patch_padding');
        $annotation = AnnotationTest::create([
            // Make the polygon large enough so the crop is not affected by the minimum
            // dimension.
            'points' => [100, 100, 100, 300, 300, 300, 300, 100],
            'shape_id' => Shape::rectangleId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->with(90, 90, 220, 220)
            ->once()
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    public function testHandleContainedNegative()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $annotation = AnnotationTest::create([
            'points' => [0, 0],
            'shape_id' => Shape::pointId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->once()
            ->with(0, 0, 148, 148)
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    public function testHandleContainedPositive()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $annotation = AnnotationTest::create([
            'points' => [1000, 750],
            'shape_id' => Shape::pointId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->once()
            ->with(852, 602, 148, 148)
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    public function testHandleContainedTooLarge()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $image->width = 100;
        $image->height = 100;

        $annotation = AnnotationTest::create([
            'points' => [50, 50],
            'shape_id' => Shape::pointId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->once()
            ->with(0, 0, 100, 100)
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    public function testHandleMinDimension()
    {
        config(['thumbnails.height' => 100, 'thumbnails.width' => 100]);
        Storage::fake('test');
        $image = $this->getImageMock();
        $annotation = AnnotationTest::create([
            'points' => [60, 60, 10],
            'shape_id' => Shape::circleId(),
        ]);
        $job = new GenerateAnnotationPatchStub($annotation, 'test');
        $job->mock = $image;

        $image->shouldReceive('crop')
            ->with(10, 10, 100, 100)
            ->once()
            ->andReturn($image);

        $image->shouldReceive('writeToBuffer')->once();
        $job->handleImage($annotation->image, 'abc');
    }

    protected function getImageMock($times = 1)
    {
        $image = Mockery::mock();
        $image->width = 1000;
        $image->height = 750;
        $image->shouldReceive('resize')
            ->times($times)
            ->andReturn($image);

        return $image;
    }
}

class GenerateAnnotationPatchStub extends GenerateAnnotationPatch
{
    public function __construct(Annotation $annotation, $targetDisk)
    {
        parent::__construct($annotation, $targetDisk);
        $this->annotation = $annotation;
    }

    public function getVipsImage($path)
    {
        return $this->mock;
    }
}
