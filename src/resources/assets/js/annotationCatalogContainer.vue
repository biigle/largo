<script>
import ImageGrid from './components/catalogImageGrid.vue';
import LabelsApi from './api/labels.js';
import LargoContainer from './mixins/largoContainer.vue';

/**
 * View model for the annotation catalog
 */
export default {
    mixins: [LargoContainer],
    components: {
        catalogImageGrid: ImageGrid,
    },
    data() {
        return {
            labelTrees: [],
        };
    },
    methods: {
        queryAnnotations(label) {
            let imagePromise = LabelsApi.queryImageAnnotations({id: label.id});
            let videoPromise = LabelsApi.queryVideoAnnotations({id: label.id});

            return Promise.all([imagePromise, videoPromise]);
        },
        showOutlines() {
            this.showAnnotationOutlines = true;
        },
        hideOutlines() {
            this.showAnnotationOutlines = false;
        },
    },
    created() {
        let labelTree = biigle.$require('annotationCatalog.labelTree');
        this.labelTrees = [labelTree];
        this.showAnnotationOutlines = false;
    },
};
</script>
