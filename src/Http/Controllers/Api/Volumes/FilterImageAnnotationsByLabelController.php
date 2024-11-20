<?php

namespace Biigle\Modules\Largo\Http\Controllers\Api\Volumes;

use Generator;
use Biigle\Volume;
use Biigle\ImageAnnotation;
use Illuminate\Http\Request;
use Biigle\Http\Controllers\Api\Controller;
use Symfony\Component\HttpFoundation\StreamedJsonResponse;

class FilterImageAnnotationsByLabelController extends Controller
{
    /**
     * Show all image annotations of the volume that have a specific label attached.
     *
     * @api {get} volumes/:vid/image-annotations/filter/label/:lid Get image annotations with a label
     * @apiGroup Volumes
     * @apiName ShowVolumesImageAnnotationsFilterLabels
     * @apiParam {Number} vid The volume ID
     * @apiParam {Number} lid The Label ID
     * @apiParam (Optional arguments) {Number} take Number of image annotations to return. If this parameter is present, the most recent annotations will be returned first. Default is unlimited.
     * @apiPermission projectMember
     * @apiDescription Returns a map of image annotation IDs to their image UUIDs. If there is an active annotation session, annotations hidden by the session are not returned. Only available for image volumes.
     *
     * @param Request $request
     * @param  int  $vid Volume ID
     * @param int $lid Label ID
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $vid, $lid)
    {
        $volume = Volume::findOrFail($vid);
        $this->authorize('access', $volume);
        $this->validate($request, ['take' => 'integer']);
        $take = $request->input('take');

        $session = $volume->getActiveAnnotationSession($request->user());

        if ($session) {
            $query = ImageAnnotation::allowedBySession($session, $request->user());
        } else {
            $query = ImageAnnotation::query();
        }

        return $query->join('image_annotation_labels', 'image_annotations.id', '=', 'image_annotation_labels.annotation_id')
            ->join('images', 'image_annotations.image_id', '=', 'images.id')
            ->where('images.volume_id', $vid)
            ->where('image_annotation_labels.label_id', $lid)
            ->when($session, function ($query) use ($session, $request) {
                if ($session->hide_other_users_annotations) {
                    $query->where('image_annotation_labels.user_id', $request->user()->id);
                }
            })
            ->when(!is_null($take), function ($query) use ($take) {
                return $query->take($take);
            })
            ->select('images.uuid', 'image_annotations.id')
            ->distinct()
            ->orderBy('image_annotations.id', 'desc')
            ->pluck('images.uuid', 'image_annotations.id');
    }

        /**
     * Get all image annotations with uuids for a given volume
     * 
     * @api {get} 
     * @apiGroup Volumes
     * @apiName test
     * @apiParam {Number} id The Volume ID
     * @apiPermission user
     * @apiDescription Returns a stream containing the video uuids and their annotation labels of a volume
     * 
     * @apiSuccessExample {json} Success response:
     * [{
	 * 	"uuid":"9198ea9c-ef97-4af7-8018-407d16eafb65",
	 * 	"labels":{
	 *			"id":41,
	 *			"annotation_id":41,
	 *			"label_id":14,
	 *			"created_at":"2024-11-13T07:17:54.000000Z",
	 *			"label":{
	 *				"id":14,
	 *				"name":"a",
	 *				"color":"49f2c5",
	 *				}
	 *      }
	 * }]
     *
     * @param int $id Volume ID
     * @return \Symfony\Component\HttpFoundation\StreamedJsonResponse
     */
    public function getVolumeAnnotationLabels($id)
    {
        $volume = Volume::findOrFail($id);
        $this->authorize('access', $volume);

        $annotations = $volume->images()
        ->join('image_annotations', 'images.id', '=', 'image_annotations.image_id')
        ->join('image_annotation_labels', 'image_annotations.id', '=', 'image_annotation_labels.annotation_id')
        ->join('labels', 'image_annotation_labels.label_id', '=', 'labels.id')
        ->select(        
            'images.uuid',
            'image_annotation_labels.id as annotation_label_id',
            'image_annotation_labels.annotation_id as annotation_label_annotation_id',
            'image_annotation_labels.created_at as annotation_created_at',
            'image_annotation_labels.label_id',
            'labels.name as label_name',
            'labels.color'
        );

        $res = function() use ($annotations): Generator {
        foreach ($annotations->lazy() as $a) {
            yield [
                'uuid' => $a->uuid,
                'labels' => [
                    'id' => $a->annotation_label_id,
                    'annotation_id' => $a->annotation_label_annotation_id,
                    'label_id' => $a->label_id,
                    'created_at' => $a->annotation_created_at,
                    'label' => [
                        'id' => $a->label_id,
                        'name' => $a->label_name,
                        'color' => $a->color,
                    ]
                ],
            ];
        }
    };

        return new StreamedJsonResponse($res());
    }
}
