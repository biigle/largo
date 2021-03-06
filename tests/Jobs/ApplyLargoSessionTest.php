<?php

namespace Biigle\Tests\Modules\Largo\Jobs;

use Biigle\Modules\Largo\Jobs\ApplyLargoSession;
use Biigle\Modules\Largo\Jobs\RemoveImageAnnotationPatches;
use Biigle\Modules\Largo\Jobs\RemoveVideoAnnotationPatches;
use Biigle\Tests\ImageAnnotationLabelTest;
use Biigle\Tests\ImageAnnotationTest;
use Biigle\Tests\ImageTest;
use Biigle\Tests\LabelTest;
use Biigle\Tests\UserTest;
use Biigle\Tests\VideoAnnotationLabelTest;
use Biigle\Tests\VideoAnnotationTest;
use Biigle\Tests\VideoTest;
use TestCase;

class ApplyLargoSessionTest extends TestCase
{
    public function testChangedAlreadyExistsImageAnnotations()
    {
        $user = UserTest::create();
        $image = ImageTest::create();
        $a1 = ImageAnnotationTest::create(['image_id' => $image->id]);

        $l1 = LabelTest::create();
        $al1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();
        $al2 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l2->id,
        ]);

        $dismissed = [$al1->label_id => [$a1->id]];
        // This already exists from the same user!
        $changed = [$al2->label_id => [$a1->id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);
        $job->handle();

        $this->assertEquals(1, $a1->labels()->count());
        $this->assertEquals($al2->id, $a1->labels()->first()->id);
    }

    public function testChangedAlreadyExistsVideoAnnotations()
    {
        $user = UserTest::create();
        $video = VideoTest::create();
        $a1 = VideoAnnotationTest::create(['video_id' => $video->id]);

        $l1 = LabelTest::create();
        $al1 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();
        $al2 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l2->id,
        ]);

        $dismissed = [$al1->label_id => [$a1->id]];
        // This already exists from the same user!
        $changed = [$al2->label_id => [$a1->id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);
        $job->handle();

        $this->assertEquals(1, $a1->labels()->count());
        $this->assertEquals($al2->id, $a1->labels()->first()->id);
    }

    public function testChangedDuplicateImageAnnotations()
    {
        $user = UserTest::create();
        $image = ImageTest::create();
        $a1 = ImageAnnotationTest::create(['image_id' => $image->id]);
        $l1 = LabelTest::create();
        $al1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();

        $dismissed = [$al1->label_id => [$a1->id]];
        // The same annotation may occur multiple times e.g. if it should be
        // changed "from A to C" and "from B to C" at the same time.
        $changed = [$l2->id => [$a1->id, $a1->id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);
        $job->handle();

        $this->assertEquals(1, $a1->labels()->count());
        $this->assertEquals($l2->id, $a1->labels()->first()->label_id);
    }

    public function testChangedDuplicateVideoAnnotations()
    {
        $user = UserTest::create();
        $video = VideoTest::create();
        $a1 = VideoAnnotationTest::create(['video_id' => $video->id]);
        $l1 = LabelTest::create();
        $al1 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();

        $dismissed = [$al1->label_id => [$a1->id]];
        // The same annotation may occur multiple times e.g. if it should be
        // changed "from A to C" and "from B to C" at the same time.
        $changed = [$l2->id => [$a1->id, $a1->id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);
        $job->handle();

        $this->assertEquals(1, $a1->labels()->count());
        $this->assertEquals($l2->id, $a1->labels()->first()->label_id);
    }

    public function testAnnotationMeanwhileDeletedImageAnnotations()
    {
        $user = UserTest::create();
        $image = ImageTest::create();
        $a1 = ImageAnnotationTest::create(['image_id' => $image->id]);
        $a2 = ImageAnnotationTest::create(['image_id' => $image->id]);

        $l1 = LabelTest::create();
        $al1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $al2 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a2->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();

        $dismissed = [$al1->label_id => [$a1->id, $a2->id]];
        $changed = [$l2->id => [$a1->id, $a1->id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);
        // annotation was deleted during the Largo session but saving should still work
        $a2->delete();
        $job->handle();

        $this->assertEquals($l2->id, $a1->labels()->first()->label_id);
    }

    public function testAnnotationMeanwhileDeletedVideoAnnotations()
    {
        $user = UserTest::create();
        $video = VideoTest::create();
        $a1 = VideoAnnotationTest::create(['video_id' => $video->id]);
        $a2 = VideoAnnotationTest::create(['video_id' => $video->id]);

        $l1 = LabelTest::create();
        $al1 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $al2 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a2->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();

        $dismissed = [$al1->label_id => [$a1->id, $a2->id]];
        $changed = [$l2->id => [$a1->id, $a1->id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);
        // annotation was deleted during the Largo session but saving should still work
        $a2->delete();
        $job->handle();

        $this->assertEquals($l2->id, $a1->labels()->first()->label_id);
    }

    public function testLabelMeanwhileDeletedImageAnnotations()
    {
        $user = UserTest::create();
        $image = ImageTest::create();
        $a1 = ImageAnnotationTest::create(['image_id' => $image->id]);
        $a2 = ImageAnnotationTest::create(['image_id' => $image->id]);

        $l1 = LabelTest::create();
        $al1 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $al2 = ImageAnnotationLabelTest::create([
            'annotation_id' => $a2->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();
        $l3 = LabelTest::create();

        $dismissed = [$al1->label_id => [$a1->id, $a2->id]];
        $changed = [$l2->id => [$a1->id], $l3->id => [$a2->id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);

        $l2->delete();
        $job->handle();

        $this->assertEquals($l1->id, $a1->labels()->first()->label_id);
        $this->assertEquals($l3->id, $a2->labels()->first()->label_id);
    }

    public function testLabelMeanwhileDeletedVideoAnnotations()
    {
        $user = UserTest::create();
        $video = VideoTest::create();
        $a1 = VideoAnnotationTest::create(['video_id' => $video->id]);
        $a2 = VideoAnnotationTest::create(['video_id' => $video->id]);

        $l1 = LabelTest::create();
        $al1 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a1->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $al2 = VideoAnnotationLabelTest::create([
            'annotation_id' => $a2->id,
            'user_id' => $user->id,
            'label_id' => $l1->id,
        ]);

        $l2 = LabelTest::create();
        $l3 = LabelTest::create();

        $dismissed = [$al1->label_id => [$a1->id, $a2->id]];
        $changed = [$l2->id => [$a1->id], $l3->id => [$a2->id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);

        $l2->delete();
        $job->handle();

        $this->assertEquals($l1->id, $a1->labels()->first()->label_id);
        $this->assertEquals($l3->id, $a2->labels()->first()->label_id);
    }

    public function testDismissImageAnnotations()
    {
        $this->expectsJobs(RemoveImageAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, [], [], [], false);
        $job->handle();

        // al1 was dismissed but not changed, should be deleted.
        $this->assertFalse($al1->exists());
        $this->assertFalse($al1->annotation()->exists());
    }

    public function testDismissVideoAnnotations()
    {
        $this->expectsJobs(RemoveVideoAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, [], false);
        $job->handle();

        // al1 was dismissed but not changed, should be deleted.
        $this->assertFalse($al1->exists());
        $this->assertFalse($al1->annotation()->exists());
    }

    public function testDismissForceImageAnnotations()
    {
        $this->expectsJobs(RemoveImageAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $user2 = UserTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user2, $dismissed, [], [], [], true);
        $job->handle();

        $this->assertFalse($al1->exists());
        $this->assertFalse($al1->annotation()->exists());
    }

    public function testDismissForceVideoAnnotations()
    {
        $this->expectsJobs(RemoveVideoAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $user2 = UserTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user2, [], [], $dismissed, [], true);
        $job->handle();

        $this->assertFalse($al1->exists());
        $this->assertFalse($al1->annotation()->exists());
    }

    public function testChangeOwnImageAnnotations()
    {
        $this->doesntExpectJobs(RemoveImageAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $l1 = LabelTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);
        $job->handle();

        // al1 was dismissed and then changed, should have a new annotation label
        $this->assertNull($al1->fresh());
        $this->assertEquals($l1->id, $annotation->labels()->first()->label_id);
    }

    public function testChangeOwnVideoAnnotations()
    {
        $this->doesntExpectJobs(RemoveVideoAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $l1 = LabelTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);
        $job->handle();

        // al1 was dismissed and then changed, should have a new annotation label
        $this->assertNull($al1->fresh());
        $this->assertEquals($l1->id, $annotation->labels()->first()->label_id);
    }

    public function testChangeOtherImageAnnotations()
    {
        $this->doesntExpectJobs(RemoveImageAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $l1 = LabelTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $user2 = UserTest::create();
        $job = new ApplyLargoSession('job_id', $user2, $dismissed, $changed, [], [], false);
        $job->handle();

        // a1 was dismissed and changed but the label does not belong to the user,
        // should get a new additional label.
        $this->assertNotNull($al1->fresh());
        $this->assertNotNull($annotation->fresh());
        $this->assertEquals(2, $annotation->labels()->count());
    }

    public function testChangeOtherVideoAnnotations()
    {
        $this->doesntExpectJobs(RemoveVideoAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $l1 = LabelTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $user2 = UserTest::create();
        $job = new ApplyLargoSession('job_id', $user2, [], [], $dismissed, $changed, false);
        $job->handle();

        // a1 was dismissed and changed but the label does not belong to the user,
        // should get a new additional label.
        $this->assertNotNull($al1->fresh());
        $this->assertNotNull($annotation->fresh());
        $this->assertEquals(2, $annotation->labels()->count());
    }

    public function testChangeOtherForceImageAnnotations()
    {
        $this->doesntExpectJobs(RemoveImageAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $l1 = LabelTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $user2 = UserTest::create();
        $job = new ApplyLargoSession('job_id', $user2, $dismissed, $changed, [], [], true);
        $job->handle();

        $this->assertNull($al1->fresh());
        $this->assertNotNull($annotation->fresh());
        $this->assertEquals($l1->id, $annotation->labels()->first()->label_id);
    }

    public function testChangeOtherForceVideoAnnotations()
    {
        $this->doesntExpectJobs(RemoveVideoAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $l1 = LabelTest::create();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $user2 = UserTest::create();
        $job = new ApplyLargoSession('job_id', $user2, [], [], $dismissed, $changed, true);
        $job->handle();

        $this->assertNull($al1->fresh());
        $this->assertNotNull($annotation->fresh());
        $this->assertEquals($l1->id, $annotation->labels()->first()->label_id);
    }

    public function testChangeMultipleImageAnnotations()
    {
        $this->doesntExpectJobs(RemoveImageAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $al2 = ImageAnnotationLabelTest::create([
            'user_id' => $user->id,
            'annotation_id' => $annotation->id,
        ]);
        $l1 = LabelTest::create();
        $l2 = LabelTest::create();

        $dismissed = [
            $al1->label_id => [$al1->annotation_id],
            $al2->label_id => [$al1->annotation_id],
        ];
        $changed = [
            $l1->id => [$al1->annotation_id],
            $l2->id => [$al1->annotation_id],
        ];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);
        $job->handle();

        $this->assertNull($al1->fresh());
        $this->assertNull($al2->fresh());
        $this->assertNotNull($annotation->fresh());
        $labels = $annotation->labels()->pluck('label_id');
        $this->assertCount(2, $labels);
        $this->assertContains($l1->id, $labels);
        $this->assertContains($l2->id, $labels);
    }

    public function testChangeMultipleVideoAnnotations()
    {
        $this->doesntExpectJobs(RemoveVideoAnnotationPatches::class);
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $annotation = $al1->annotation;
        $al2 = VideoAnnotationLabelTest::create([
            'user_id' => $user->id,
            'annotation_id' => $annotation->id,
        ]);
        $l1 = LabelTest::create();
        $l2 = LabelTest::create();

        $dismissed = [
            $al1->label_id => [$al1->annotation_id],
            $al2->label_id => [$al1->annotation_id],
        ];
        $changed = [
            $l1->id => [$al1->annotation_id],
            $l2->id => [$al1->annotation_id],
        ];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);
        $job->handle();

        $this->assertNull($al1->fresh());
        $this->assertNull($al2->fresh());
        $this->assertNotNull($annotation->fresh());
        $labels = $annotation->labels()->pluck('label_id');
        $this->assertCount(2, $labels);
        $this->assertContains($l1->id, $labels);
        $this->assertContains($l2->id, $labels);
    }

    public function testRemoveJobIdOnFinishImageAnnotations()
    {
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $volume = $al1->annotation->image->volume;
        $l1 = LabelTest::create();

        $volume->attrs = ['largo_job_id' => 'job_id'];
        $volume->save();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user, $dismissed, $changed, [], [], false);
        $job->handle();

        $this->assertEmpty($volume->fresh()->attrs);
    }

    public function testRemoveJobIdOnFinishVideoAnnotations()
    {
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $volume = $al1->annotation->video->volume;
        $l1 = LabelTest::create();

        $volume->attrs = ['largo_job_id' => 'job_id'];
        $volume->save();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $job = new ApplyLargoSession('job_id', $user, [], [], $dismissed, $changed, false);
        $job->handle();

        $this->assertEmpty($volume->fresh()->attrs);
    }

    public function testRemoveJobIdOnErrorImageAnnotations()
    {
        $user = UserTest::create();
        $al1 = ImageAnnotationLabelTest::create(['user_id' => $user->id]);
        $volume = $al1->annotation->image->volume;
        $l1 = LabelTest::create();

        $volume->attrs = ['largo_job_id' => 'job_id'];
        $volume->save();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $job = new ApplyLargoSessionStub('job_id', $user, $dismissed, $changed, [], [], false);
        try {
            $job->handle();
        } catch (\Exception $e) {
            // ignore
        }

        $this->assertEmpty($volume->fresh()->attrs);
    }

    public function testRemoveJobIdOnErrorVideoAnnotations()
    {
        $user = UserTest::create();
        $al1 = VideoAnnotationLabelTest::create(['user_id' => $user->id]);
        $volume = $al1->annotation->video->volume;
        $l1 = LabelTest::create();

        $volume->attrs = ['largo_job_id' => 'job_id'];
        $volume->save();

        $dismissed = [$al1->label_id => [$al1->annotation_id]];
        $changed = [$l1->id => [$al1->annotation_id]];
        $job = new ApplyLargoSessionStub('job_id', $user, [], [], $dismissed, $changed, false);
        try {
            $job->handle();
        } catch (\Exception $e) {
            // ignore
        }

        $this->assertEmpty($volume->fresh()->attrs);
    }
}

class ApplyLargoSessionStub extends ApplyLargoSession
{
    protected function ignoreDeletedLabels($dismissed, $changed)
    {
        throw new \Exception;
    }
}
