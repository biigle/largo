@if ($user->can('edit-in', $project) && $project->imageVolumes()->exists())
    <li role="presentation">
        <a href="{{route('projectsLargo', $project->id)}}" title="Perform Largo re-evaluation of image annotations for this project"><i class="fa fa-check-square"></i> Largo</a>
    </li>
@endif
