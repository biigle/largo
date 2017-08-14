/**
 * Mixin for largo view models
 */
biigle.$declare('largo.mixins.largoContainer', {
    mixins: [biigle.$require('core.mixins.loader')],
    components: {
        labelTrees: biigle.$require('labelTrees.components.labelTrees'),
        sidebar: biigle.$require('core.components.sidebar'),
        sidebarTab: biigle.$require('core.components.sidebarTab'),
        dismissImageGrid: biigle.$require('largo.components.dismissImageGrid'),
        relabelImageGrid: biigle.$require('largo.components.relabelImageGrid'),
    },
    data: {
        labelTrees: [],
        step: 0,
        selectedLabel: null,
        annotationsCache: {},
    },
    computed: {
        isInDismissStep: function () {
            return this.step === 0;
        },
        isInRelabelStep: function () {
            return this.step === 1;
        },
        annotations: function () {
            if (this.selectedLabel && this.annotationsCache.hasOwnProperty(this.selectedLabel.id)) {
                return this.annotationsCache[this.selectedLabel.id];
            }

            return [];
        },
        allAnnotations: function () {
            var annotations = [];
            for (var id in this.annotationsCache) {
                if (!this.annotationsCache.hasOwnProperty(id)) continue;
                Array.prototype.push.apply(annotations, this.annotationsCache[id]);
            }

            return annotations;
        },
        hasNoAnnotations: function () {
            return this.selectedLabel && !this.loading && this.annotations.length === 0;
        },
        dismissedAnnotations: function () {
            return this.allAnnotations.filter(function (item) {
                return item.dismissed;
            });
        },
        hasDismissedAnnotations: function () {
            return this.dismissedAnnotations.length > 0;
        },
        dismissedToSave: function () {
            var annotations = this.dismissedAnnotations;
            var dismissed = {};

            for (var i = annotations.length - 1; i >= 0; i--) {
                if (dismissed.hasOwnProperty(annotations[i].label_id)) {
                    dismissed[annotations[i].label_id].push(annotations[i].id);
                } else {
                    dismissed[annotations[i].label_id] = [annotations[i].id];
                }
            }

            return dismissed;
        },
        changedToSave: function () {
            var annotations = this.dismissedAnnotations.filter(function (item) {
                return !!item.newLabel;
            });
            var changed = {};

            for (var i = annotations.length - 1; i >= 0; i--) {
                changed[annotations[i].id] = annotations[i].newLabel.id;
            }

            return changed;
        },
        events: function () {
            return biigle.$require('events');
        },
    },
    methods: {
        getAnnotations: function (label) {
            if (!this.annotationsCache.hasOwnProperty(label.id)) {
                var self = this;
                // Load only once
                Vue.set(self.annotationsCache, label.id, []);
                this.startLoading();
                this.queryAnnotations(label)
                    .then(function (response) {
                        self.gotAnnotations(label, response.data);
                    }, biigle.$require('messages.store').handleErrorResponse)
                    .finally(this.finishLoading);
            }
        },
        gotAnnotations: function (label, annotations) {
            // This is the object that we will use to store information for each
            // annotation patch.
            annotations = annotations.map(function (id) {
                return {
                    id: id,
                    label_id: label.id,
                    blob: null,
                    dismissed: false,
                    newLabel: null,
                };
            });

            Vue.set(this.annotationsCache, label.id, annotations);
        },
        handleSelectedLabel: function (label) {
            this.selectedLabel = label;

            if (this.isInDismissStep) {
                this.getAnnotations(label);
            }
        },
        handleDeselectedLabel: function () {
            this.selectedLabel = null;
        },
        handleDismissedImage: function (image) {
            image.dismissed = true;
        },
        handleUndismissedImage: function (image) {
            image.dismissed = false;
            image.newLabel = null;
        },
        goToRelabel: function () {
            this.step = 1;
        },
        goToDismiss: function () {
            this.step = 0;
            if (this.selectedLabel) {
                this.getAnnotations(this.selectedLabel);
            }
        },
        handleRelabelledImage: function (image) {
            if (this.selectedLabel) {
                image.newLabel = this.selectedLabel;
            }
        },
        handleUnrelabelledImage: function (image) {
            // If a new label is selected, swap the label instead of removing it.
            if (this.selectedLabel && image.newLabel.id !== this.selectedLabel.id) {
                image.newLabel = this.selectedLabel;
            } else {
                image.newLabel = null;
            }
        },
        save: function () {
            if (this.loading) return;
            this.loading = true;

            this.performSave(this.dismissedToSave, this.changedToSave)
                .then(this.saved, biigle.$require('messages.store').handleErrorResponse)
                .finally(this.finishLoading);
        },
        saved: function () {
            biigle.$require('messages.store').success('Saved.  You can now start a new re-evaluation session.');
            this.step = 0;
            for (var key in this.annotationsCache) {
                if (!this.annotationsCache.hasOwnProperty(key)) continue;
                delete this.annotationsCache[key];
            }
            this.handleSelectedLabel(this.selectedLabel);
        },
    },
    watch: {
        annotations: function (annotations) {
            this.events.$emit('annotations-count', annotations.length);
        },
        dismissedAnnotations: function (annotations) {
            this.events.$emit('dismissed-annotations-count', annotations.length);
        },
        step: function (step) {
            this.events.$emit('step', step);
        },
    },
});