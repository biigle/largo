<?php

namespace Biigle\Tests\Modules\Largo\Http\Controllers\Api\Volumes;

use ApiTestCase;
use Carbon\Carbon;
use Biigle\Tests\ImageTest;
use Biigle\Tests\LabelTest;
use Biigle\Tests\ProjectTest;
use Biigle\Tests\ImageAnnotationTest;
use Biigle\Tests\AnnotationSessionTest;
use Biigle\Tests\ImageAnnotationLabelTest;

class FilterImageAnnotationsByLabelControllerTest extends ApiTestCase
{
    public function testIndex()
    {
        $id = $this->volume()->id;

        $image = ImageTest::create(['volume_id' => $id]);
        $a1 = ImageAnnotationTest::create(['image_id' => $image->id]);
        $a2 = ImageAnnotationTest::create(['image_id' => $image->id]);
        $a3 = ImageAnnotationTest::create(['image_id' => $image->id]);

        $l1 = ImageAnnotationLabelTest::create(['annotation_id' => $a1->id]);
        $l2 = ImageAnnotationLabelTest::create(['annotation_id' => $a2->id, 'label_id' => $l1->label_id]);
        $l3 = ImageAnnotationLabelTest::create(['annotation_id' => $a3->id]);

        // annotation from other volume should not appear
        ImageAnnotationTest::create();

        $this->doTestApiRoute('GET', "/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}");

        $this->beUser();
        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(403);

        $this->beGuest();
        // take must be integer
        $this->json('GET', "/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}", ['take' => 'abc'])
            ->assertStatus(422);

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(200)
            ->assertExactJson([$a2->id => $image->uuid, $a1->id => $image->uuid]);

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l3->label_id}")
            ->assertStatus(200)
            ->assertExactJson([$a3->id => $image->uuid]);

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}?take=1")
            ->assertStatus(200)
            ->assertExactJson([$a2->id => $image->uuid]);
    }

    public function testIndexAnnotationSession()
    {
        $id = $this->volume()->id;
        $image = ImageTest::create(['volume_id' => $id]);

        $a1 = ImageAnnotationTest::create([
            'image_id' => $image->id,
            'created_at' => Carbon::yesterday(),
        ]);

        $a2 = ImageAnnotationTest::create([
            'image_id' => $image->id,
            'created_at' => Carbon::today(),
        ]);

        $a3 = ImageAnnotationTest::create([
            'image_id' => $image->id,
            'created_at' => Carbon::yesterday(),
        ]);

        $l1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $this->editor()->id,
        ]);

        $l2 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a2->id,
            'label_id' => $l1->label_id,
            'user_id' => $this->editor()->id,
        ]);

        $l3 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a3->id,
            'label_id' => $l1->label_id,
            'user_id' => $this->admin()->id,
        ]);

        $this->beEditor();

        // test hide own
        $session = AnnotationSessionTest::create([
            'volume_id' => $id,
            'starts_at' => Carbon::today(),
            'ends_at' => Carbon::tomorrow(),
            'hide_own_annotations' => true,
            'hide_other_users_annotations' => false,
        ]);

        $session->users()->attach($this->editor());

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(200)
            ->assertExactJson([$a2->id => $image->uuid, $a3->id => $image->uuid]);

        // test hide other
        $session->hide_own_annotations = false;
        $session->hide_other_users_annotations = true;
        $session->save();

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(200)
            ->assertExactJson([$a1->id => $image->uuid, $a2->id => $image->uuid]);

        // test hide both
        $session->hide_own_annotations = true;
        $session->save();

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(200)
            ->assertExactJson([$a2->id => $image->uuid]);

        $session->users()->detach($this->editor());

        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(200)
            ->assertExactJson([
                $a1->id => $image->uuid,
                $a2->id => $image->uuid,
                $a3->id => $image->uuid,
            ]);
    }

    public function testIndexAnnotationSessionEdgeCaseHideOther()
    {
        $id = $this->volume()->id;
        $image = ImageTest::create(['volume_id' => $id]);
        $a1 = ImageAnnotationTest::create([
            'image_id' => $image->id,
        ]);
        $l1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $this->editor()->id,
        ]);
        $l2 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $this->admin()->id,
        ]);
        $session = AnnotationSessionTest::create([
            'volume_id' => $id,
            'starts_at' => Carbon::yesterday(),
            'ends_at' => Carbon::tomorrow(),
            'hide_own_annotations' => false,
            'hide_other_users_annotations' => true,
        ]);
        $session->users()->attach($this->editor());

        $this->beEditor();
        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l2->label_id}")
            ->assertStatus(200)
            ->assertExactJson([]);
    }

    public function testIndexDuplicate()
    {
        $id = $this->volume()->id;
        $image = ImageTest::create(['volume_id' => $id]);

        $a1 = ImageAnnotationTest::create([
            'image_id' => $image->id,
        ]);

        $l1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $this->editor()->id,
        ]);

        $l2 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'label_id' => $l1->label_id,
            'user_id' => $this->admin()->id,
        ]);

        $this->beEditor();
        $this->get("/api/v1/volumes/{$id}/image-annotations/filter/label/{$l1->label_id}")
            ->assertStatus(200)
            ->assertExactJson([$a1->id => $image->uuid]);
    }

    public function testGetVolumeAnnotationLabels()
    {
        $id = $this->volume()->id;
        $project = ProjectTest::create();
        $img = ImageTest::create(['volume_id' => $id, 'filename' => 'abc.jpg']);
        $a = ImageAnnotationTest::create(['image_id' => $img]);
        $l = LabelTest::create();
        $expectedLabel = [...$l->get()->toArray()[0], "uuid" => $l->uuid, "count" => 2];
        ImageAnnotationLabelTest::create(['annotation_id' => $a->id, 'label_id' => $l->id]);
        ImageAnnotationLabelTest::create(['annotation_id' => $a->id, 'label_id' => $l->id]);

        $project->volumes()->attach($id);

        $this->doTestApiRoute('GET', "/api/v1/volume/{$id}/image-annotations");

        $this->beUser();
        $this->getJson("/api/v1/volume/{$id}/image-annotations")
            ->assertStatus(403);

        $this->beEditor();

        $response = $this->getJson("/api/v1/volume/{$id}/image-annotations")->assertStatus(200);
        $content = json_decode($response->getContent())[0];

        $this->assertNotEmpty($content);
        $this->assertEquals($expectedLabel, (array) $content);
    }

    public function testGetVolumeWithoutAnnotationsAnnotationLabels()
    {
        $id = $this->volume()->id;
        $project = ProjectTest::create();
        ImageTest::create(['volume_id' => $this->volume()->id]);
        $project->volumes()->attach($id);

        $this->doTestApiRoute('GET', "/api/v1/volume/{$id}/video-annotations");

        $this->beUser();
        $this->getJson("/api/v1/volume/{$id}/video-annotations")
            ->assertStatus(403);

        $this->beEditor();
        $response = $this->getJson("/api/v1/volume/{$id}/video-annotations")->assertStatus(200);
        $content = json_decode($response->getContent());

        $this->assertEmpty($content);
    }
}
