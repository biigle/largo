/**
 * Mixin for largo view models
 */
biigle.$declare('largo.mixins.largoContainer', {
    mixins: [biigle.$require('core.mixins.loader')],
    components: {
        labelTrees: biigle.$require('labelTrees.components.labelTrees'),
        sidebar: biigle.$require('core.components.sidebar'),
        sidebarTab: biigle.$require('core.components.sidebarTab'),
        powerToggle: biigle.$require('core.components.powerToggle'),
        dismissImageGrid: biigle.$require('largo.components.dismissImageGrid'),
        relabelImageGrid: biigle.$require('largo.components.relabelImageGrid'),
    },
    data: {
        labelTrees: [],
        step: 0,
        selectedLabel: null,
        annotationsCache: {},
        lastSelectedImage: null,
        forceChange: false,
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
        annotationsWithNewLabel: function () {
            return this.dismissedAnnotations.filter(function (item) {
                return !!item.newLabel;
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
            var annotations = this.annotationsWithNewLabel;
            var changed = {};

            for (var i = annotations.length - 1; i >= 0; i--) {
                if (changed.hasOwnProperty(annotations[i].newLabel.id)) {
                    changed[annotations[i].newLabel.id].push(annotations[i].id);
                } else {
                    changed[annotations[i].newLabel.id] = [annotations[i].id];
                }
            }

            return changed;
        },
        toDeleteCount: function () {
            return this.dismissedAnnotations.length - this.annotationsWithNewLabel.length;
        },
        events: function () {
            return biigle.$require('events');
        },
        saveButtonClass: function () {
            return this.forceChange ? 'btn-danger' : 'btn-success';
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
            annotations = Object.keys(annotations)
                .map(function (id) {
                    return {
                        id: id,
                        uuid: annotations[id],
                        label_id: label.id,
                        dismissed: false,
                        newLabel: null,
                    };
                })
                // Show the newest annotations (with highest ID) first.
                .sort(function (a, b) {
                    return b.id - a.id;
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
        handleSelectedImageDismiss: function (image, event) {
            if (image.dismissed) {
                image.dismissed = false;
                image.newLabel = null;
            } else {
                image.dismissed = true;
                if (event.shiftKey && this.lastSelectedImage) {
                    this.dismissAllImagesBetween(image, this.lastSelectedImage);
                } else {
                    this.lastSelectedImage = image;
                }
            }
        },
        goToRelabel: function () {
            this.step = 1;
            this.lastSelectedImage = null;
        },
        goToDismiss: function () {
            this.step = 0;
            this.lastSelectedImage = null;
            if (this.selectedLabel) {
                this.getAnnotations(this.selectedLabel);
            }
        },
        handleSelectedImageRelabel: function (image, event) {
            if (image.newLabel) {
                // If a new label is selected, swap the label instead of removing it.
                if (this.selectedLabel && image.newLabel.id !== this.selectedLabel.id) {
                    image.newLabel = this.selectedLabel;
                } else {
                    image.newLabel = null;
                }
            } else if (this.selectedLabel) {
                image.newLabel = this.selectedLabel;
                if (event.shiftKey && this.lastSelectedImage) {
                    this.relabelAllImagesBetween(image, this.lastSelectedImage);
                } else {
                    this.lastSelectedImage = image;
                }
            }
        },
        save: function () {
            if (this.loading || (this.toDeleteCount > 0 && !confirm('This might delete ' + this.toDeleteCount + ' annotation(s). Continue?'))) {
                return;
            }

            this.startLoading();
            this.performSave({
                    dismissed: this.dismissedToSave,
                    changed: this.changedToSave,
                    force: this.forceChange,
                })
                .then(this.saved, biigle.$require('messages.store').handleErrorResponse)
                .finally(this.finishLoading);
        },
        saved: function () {
            biigle.$require('messages.store').success('Saved. You can now start a new re-evaluation session.');
            this.step = 0;
            for (var key in this.annotationsCache) {
                if (!this.annotationsCache.hasOwnProperty(key)) continue;
                delete this.annotationsCache[key];
            }
            this.handleSelectedLabel(this.selectedLabel);
        },
        performOnAllImagesBetween: function (image1, image2, callback) {
            var index1 = this.allAnnotations.indexOf(image1);
            var index2 = this.allAnnotations.indexOf(image2);
            if (index2 < index1) {
                var tmp = index2;
                index2 = index1;
                index1 = tmp;
            }

            for (var i = index1 + 1; i < index2; i++) {
                callback(this.allAnnotations[i]);
            }

        },
        dismissAllImagesBetween: function (image1, image2) {
            this.performOnAllImagesBetween(image1, image2, function (image) {
                image.dismissed = true;
            });
        },
        relabelAllImagesBetween: function (image1, image2) {
            var label = this.selectedLabel;
            this.performOnAllImagesBetween(image1, image2, function (image) {
                if (image.dismissed) {
                    image.newLabel = label;
                }
            });
        },
        enableForceChange: function () {
            this.forceChange = true;
        },
        disableForceChange: function () {
            this.forceChange = false;
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
