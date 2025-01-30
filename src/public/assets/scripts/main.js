(()=>{"use strict";var t,e={456:()=>{var t="imageAnnotation",e="videoAnnotation";function n(t,e,n,i,s,o,a,r){var l,u="function"==typeof t?t.options:t;if(e&&(u.render=e,u.staticRenderFns=n,u._compiled=!0),i&&(u.functional=!0),o&&(u._scopeId="data-v-"+o),a?(l=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),s&&s.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(a)},u._ssrRegister=l):s&&(l=r?function(){s.call(this,(u.functional?this.parent:this).$root.$options.shadowRoot)}:s),l)if(u.functional){u._injectStyles=l;var c=u.render;u.render=function(t,e){return l.call(e),c(t,e)}}else{var d=u.beforeCreate;u.beforeCreate=d?[].concat(d,l):[l]}return{exports:t,options:u}}const i=n({computed:{id:function(){return this.image.id},uuid:function(){return this.image.uuid},type:function(){return this.image.type},patchPrefix:function(){return this.uuid[0]+this.uuid[1]+"/"+this.uuid[2]+this.uuid[3]+"/"+this.uuid},urlTemplate:function(){return biigle.$require("largo.patchUrlTemplate")}},methods:{getThumbnailUrl:function(){return this.type===e?this.urlTemplate.replace(":prefix",this.patchPrefix).replace(":id","v-".concat(this.id)):this.urlTemplate.replace(":prefix",this.patchPrefix).replace(":id",this.id)}},created:function(){this.type===t?this.showAnnotationRoute=biigle.$require("largo.showImageAnnotationRoute"):this.showAnnotationRoute=biigle.$require("largo.showVideoAnnotationRoute")}},undefined,undefined,!1,null,null,null).exports;const s=n({mixins:[i],props:{_id:{type:String,required:!0},_uuid:{type:String,required:!0},label:{type:Object,required:!0},emptySrc:{type:String,required:!0},_urlTemplate:{type:String,required:!0}},data:function(){return{url:""}},computed:{title:function(){return"Example annotation for label "+this.label.name},src:function(){return this.url||this.emptySrc},image:function(){return{id:this._id,uuid:this._uuid,type:t}},urlTemplate:function(){return this._urlTemplate}},methods:{showEmptyImage:function(){this.url=""}},created:function(){this.url=this.getThumbnailUrl()}},undefined,undefined,!1,null,null,null).exports,o=Vue.resource("api/v1/volumes{/id}/largo",{},{queryImageAnnotations:{method:"GET",url:"api/v1/volumes{/id}/image-annotations/filter/label{/label_id}"},queryVideoAnnotations:{method:"GET",url:"api/v1/volumes{/id}/video-annotations/filter/label{/label_id}"},queryExampleAnnotations:{method:"GET",url:"api/v1/volumes{/id}/image-annotations/examples{/label_id}"},sortAnnotationsByOutlier:{method:"GET",url:"api/v1/volumes{/id}/annotations/sort/outliers{/label_id}"},sortAnnotationsBySimilarity:{method:"GET",url:"api/v1/volumes{/id}/annotations/sort/similarity"},fetchVolumeAnnotationLabelCount:{method:"GET",url:"api/v1/volume{/id}/label-count"}});var a=biigle.$require("echo"),r=biigle.$require("events"),l=biigle.$require("messages").handleErrorResponse,u=biigle.$require("volumes.components.imageGrid"),c=biigle.$require("volumes.components.imageGridImage"),d=biigle.$require("annotations.components.labelsTabPlugins"),h=biigle.$require("labelTrees.components.labelTrees"),m=biigle.$require("core.mixins.loader"),f=biigle.$require("messages"),g=biigle.$require("core.components.powerToggle"),p=biigle.$require("core.models.Settings"),b=biigle.$require("annotations.components.settingsTabPlugins"),v=biigle.$require("core.components.sidebar"),y=biigle.$require("core.components.sidebarTab");const S=n({mixins:[m],components:{annotationPatch:s},props:{label:{default:null},volumeId:{type:Number,required:!0},count:{type:Number,default:3}},data:function(){return{exampleLabel:null,exampleAnnotations:[],cache:{},shown:!0}},computed:{isShown:function(){return this.shown&&null!==this.label},hasExamples:function(){return this.exampleLabel&&this.exampleAnnotations&&Object.keys(this.exampleAnnotations).length>0}},methods:{parseResponse:function(t){return t.data},setExampleAnnotations:function(t){(!t[0].hasOwnProperty("annotations")||Object.keys(t[0].annotations).length<this.count)&&delete this.cache[t[1]],t[0].hasOwnProperty("label")&&t[0].label.id===t[1]||delete this.cache[t[1]],this.label&&this.label.id===t[1]&&(this.exampleAnnotations=t[0].annotations,this.exampleLabel=t[0].label)},updateShown:function(t){this.shown=t},updateExampleAnnotations:function(){this.exampleAnnotations=[],this.isShown&&(this.startLoading(),this.cache.hasOwnProperty(this.label.id)||(this.cache[this.label.id]=o.queryExampleAnnotations({id:this.volumeId,label_id:this.label.id,take:this.count}).then(this.parseResponse)),Vue.Promise.all([this.cache[this.label.id],this.label.id]).then(this.setExampleAnnotations).finally(this.finishLoading))}},watch:{label:function(){this.updateExampleAnnotations()},shown:function(){this.updateExampleAnnotations()}},created:function(){r.$on("settings.exampleAnnotations",this.updateShown)}},undefined,undefined,!1,null,null,null).exports;d&&(d.exampleAnnotations=S);const w=n({components:{powerButton:g},props:{settings:{type:Object,required:!0}},data:function(){return{isShown:!0}},methods:{hide:function(){this.isShown=!1,this.settings.set("exampleAnnotations",!1)},show:function(){this.isShown=!0,this.settings.delete("exampleAnnotations")}},watch:{isShown:function(t){r.$emit("settings.exampleAnnotations",t)}},created:function(){this.settings.has("exampleAnnotations")&&(this.isShown=this.settings.get("exampleAnnotations"))}},undefined,undefined,!1,null,null,null).exports;b&&(b.exampleAnnotations=w),biigle.$declare("largo.mixins.annotationPatch",i);var A=n({mixins:[c,i],data:function(){return{showAnnotationRoute:null,overlayIsLoaded:!1,overlayHasError:!1}},inject:["outlines"],computed:{showAnnotationLink:function(){return this.showAnnotationRoute?this.showAnnotationRoute+this.image.id:""},svgSrcUrl:function(){return this.srcUrl.replace(/.[A-Za-z]*$/,".svg")},showOutlines:function(){return!this.overlayHasError&&this.outlines.showAnnotationOutlines}},methods:{handleOverlayLoad:function(){this.overlayIsLoaded=!0},handleOverlayError:function(){this.overlayHasError=!0}},created:function(){this.type===t?this.showAnnotationRoute=biigle.$require("annotationCatalog.showImageAnnotationRoute"):this.showAnnotationRoute=biigle.$require("annotationCatalog.showVideoAnnotationRoute")}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("figure",{staticClass:"image-grid__image image-grid__image--catalog",class:t.classObject},[t.showAnnotationLink?n("a",{attrs:{href:t.showAnnotationLink,target:"_blank",title:"Show the annotation in the annotation tool"}},[n("img",{attrs:{src:t.srcUrl},on:{error:t.showEmptyImage}}),t._v(" "),this.showOutlines?n("img",{directives:[{name:"show",rawName:"v-show",value:t.overlayIsLoaded,expression:"overlayIsLoaded"}],staticClass:"outlines",attrs:{src:t.svgSrcUrl},on:{error:t.handleOverlayError,load:t.handleOverlayLoad}}):t._e()]):n("img",{attrs:{src:t.srcUrl},on:{error:t.showEmptyImage}})])}),[],!1,null,null,null);const _=n({mixins:[u],components:{imageGridImage:A.exports}},undefined,undefined,!1,null,null,null).exports,C=Vue.resource("api/v1/labels{/id}",{},{queryImageAnnotations:{method:"GET",url:"api/v1/labels{/id}/image-annotations"},queryVideoAnnotations:{method:"GET",url:"api/v1/labels{/id}/video-annotations"}});var L=n({mixins:[c,i],data:function(){return{showAnnotationRoute:null,overlayIsLoaded:!1,overlayHasError:!1}},inject:["outlines"],computed:{showAnnotationLink:function(){return this.showAnnotationRoute?this.showAnnotationRoute+this.image.id:""},selected:function(){return this.image.dismissed},title:function(){return this.selected?"Undo dismissing this annotation":"Dismiss this annotation"},pinTitle:function(){return this.isPinned?"Reset sorting":"Select as reference (sort by similarity)"},svgSrcUrl:function(){return this.srcUrl.replace(/.[A-Za-z]*$/,".svg")},showAnnotationOutlines:function(){return!this.overlayHasError&&this.outlines.showAnnotationOutlines}},methods:{handleOverlayLoad:function(){this.overlayIsLoaded=!0},handleOverlayError:function(){this.overlayHasError=!0}}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("figure",{staticClass:"image-grid__image image-grid__image--largo",class:t.classObject,attrs:{title:t.title}},[t.selectable?n("div",{staticClass:"image-icon"},[n("i",{staticClass:"fas",class:t.iconClass})]):t._e(),t._v(" "),n("img",{attrs:{src:t.srcUrl},on:{error:t.showEmptyImage,click:t.toggleSelect}}),t._v(" "),this.showAnnotationOutlines?n("img",{directives:[{name:"show",rawName:"v-show",value:t.overlayIsLoaded,expression:"overlayIsLoaded"}],staticClass:"outlines",attrs:{src:t.svgSrcUrl},on:{error:t.handleOverlayError,load:t.handleOverlayLoad}}):t._e(),t._v(" "),t.pinnable||t.isPinned?n("div",{staticClass:"image-buttons-bottom"},[n("button",{staticClass:"image-button image-button__pin",attrs:{title:t.pinTitle},on:{click:t.emitPin}},[n("span",{staticClass:"fa fa-thumbtack fa-fw"})])]):t._e(),t._v(" "),t.showAnnotationLink?n("div",{staticClass:"image-buttons"},[n("a",{staticClass:"image-button",attrs:{href:t.showAnnotationLink,target:"_blank",title:"Show the annotation in the annotation tool"}},[n("span",{staticClass:"fa fa-external-link-square-alt fa-fw",attrs:{"aria-hidden":"true"}})])]):t._e()])}),[],!1,null,null,null);const I=n({mixins:[u],components:{imageGridImage:L.exports}},undefined,undefined,!1,null,null,null).exports;var O=n({mixins:[c,i],data:function(){return{showAnnotationRoute:null,overlayIsLoaded:!1,overlayHasError:!1}},inject:["outlines"],computed:{showAnnotationLink:function(){return this.showAnnotationRoute?this.showAnnotationRoute+this.image.id:""},selected:function(){return this.image.newLabel},title:function(){return this.selected?"Revert changing the label of this annotation":"Change the label of this annotation"},newLabelStyle:function(){return{"background-color":"#"+this.image.newLabel.color}},svgSrcUrl:function(){return this.srcUrl.replace(/.[A-Za-z]*$/,".svg")},showAnnotationOutlines:function(){return!this.overlayHasError&&this.outlines.showAnnotationOutlines}},methods:{handleOverlayLoad:function(){this.overlayIsLoaded=!0},handleOverlayError:function(){this.overlayHasError=!0}}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("figure",{staticClass:"image-grid__image image-grid__image--largo image-grid__image--relabel",class:t.classObject,attrs:{title:t.title}},[t.selectable?n("div",{staticClass:"image-icon"},[n("i",{staticClass:"fas",class:t.iconClass})]):t._e(),t._v(" "),n("img",{attrs:{src:t.srcUrl},on:{click:t.toggleSelect,error:t.showEmptyImage}}),t._v(" "),this.showAnnotationOutlines?n("img",{directives:[{name:"show",rawName:"v-show",value:t.overlayIsLoaded,expression:"overlayIsLoaded"}],staticClass:"outlines",attrs:{src:t.svgSrcUrl},on:{error:t.handleOverlayError,load:t.handleOverlayLoad}}):t._e(),t._v(" "),t.showAnnotationLink?n("div",{staticClass:"image-buttons"},[n("a",{staticClass:"image-button",attrs:{href:t.showAnnotationLink,target:"_blank",title:"Show the annotation in the annotation tool"}},[n("span",{staticClass:"fa fa-external-link-square-alt",attrs:{"aria-hidden":"true"}})])]):t._e(),t._v(" "),t.selected?n("div",{staticClass:"new-label"},[n("span",{staticClass:"new-label__color",style:t.newLabelStyle}),t._v(" "),n("span",{staticClass:"new-label__name",domProps:{textContent:t._s(t.image.newLabel.name)}})]):t._e()])}),[],!1,null,null,null);const x=n({mixins:[u],components:{imageGridImage:O.exports}},undefined,undefined,!1,null,null,null).exports;const T=new p({data:{storageKey:"biigle.largo.settings",defaults:{showOutlines:!0}}});const q=n({components:{PowerToggle:g},data:function(){return{restoreKeys:["showOutlines"],showOutlines:!0}},computed:{settings:function(){return T}},methods:{enableOutlines:function(){this.showOutlines=!0},disableOutlines:function(){this.showOutlines=!1}},watch:{showOutlines:function(t){this.$emit("change-outlines",t),this.settings.set("showOutlines",t)}},created:function(){var t=this;this.restoreKeys.forEach((function(e){t[e]=t.settings.get(e)}))}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"settings-tab"},[n("div",{staticClass:"largo-tab__button"},[n("power-toggle",{attrs:{active:t.showOutlines},on:{on:t.enableOutlines,off:t.disableOutlines}},[t._v("\n            Show annotation outlines\n        ")])],1)])}),[],!1,null,null,null).exports;var $=0,E=1,R=0,k=1,P=2;const B=n({props:{sortKey:{type:Number,required:!0},sortDirection:{type:Number,required:!0},needsSimilarityReference:{type:Boolean,default:!1}},computed:{sortedAscending:function(){return this.sortDirection===$},sortedDescending:function(){return this.sortDirection===E},sortingByAnnotationId:function(){return this.sortKey===R},sortingByOutlier:function(){return this.sortKey===k},sortingBySimilarity:function(){return this.sortKey===P}},methods:{sortAscending:function(){this.$emit("change-direction",$)},sortDescending:function(){this.$emit("change-direction",E)},reset:function(){this.sortDescending(),this.sortByAnnotationId()},sortByAnnotationId:function(){this.$emit("change-key",R),this.needsSimilarityReference&&this.cancelSortBySimilarity()},sortByOutlier:function(){this.$emit("change-key",k),this.needsSimilarityReference&&this.cancelSortBySimilarity()},initializeSortBySimilarity:function(){this.$emit("init-similarity")},cancelSortBySimilarity:function(){this.$emit("cancel-similarity")}}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"sorting-tab"},[n("div",{staticClass:"sorting-tab__buttons"},[n("div",{staticClass:"btn-group",attrs:{role:"group"}},[n("button",{staticClass:"btn btn-default",class:{active:t.sortedDescending},attrs:{type:"button",title:"Sort descending"},on:{click:t.sortDescending}},[n("span",{staticClass:"fa fa-sort-amount-down"})]),t._v(" "),n("button",{staticClass:"btn btn-default",class:{active:t.sortedAscending},attrs:{type:"button",title:"Sort ascending"},on:{click:t.sortAscending}},[n("span",{staticClass:"fa fa-sort-amount-up"})])]),t._v(" "),n("div",{staticClass:"btn-group pull-right",attrs:{role:"group"}},[n("button",{staticClass:"btn btn-default",attrs:{type:"button",title:"Reset sorting"},on:{click:t.reset}},[n("span",{staticClass:"fa fa-times"})])])]),t._v(" "),n("div",{staticClass:"list-group sorter-list-group"},[n("button",{staticClass:"list-group-item",class:{active:t.sortingByAnnotationId},attrs:{title:"Sort by annotation timestamp (higher is newer)"},on:{click:t.sortByAnnotationId}},[t._v("\n            Created\n        ")]),t._v(" "),n("button",{staticClass:"list-group-item",class:{active:t.sortingByOutlier},attrs:{title:"Sort by outliers (higher is more dissimilar)"},on:{click:t.sortByOutlier}},[t._v("\n            Outliers\n        ")]),t._v(" "),n("a",{staticClass:"list-group-item",class:{active:t.sortingBySimilarity,"list-group-item-warning":t.needsSimilarityReference},attrs:{title:"Sort by similarity (higher is more similar)",href:"#"},on:{click:function(e){return e.preventDefault(),t.initializeSortBySimilarity.apply(null,arguments)}}},[t.needsSimilarityReference?n("button",{staticClass:"btn btn-default btn-xs pull-right",attrs:{title:"Cancel selecting a reference annotation"},on:{click:function(e){return e.stopPropagation(),t.cancelSortBySimilarity.apply(null,arguments)}}},[n("i",{staticClass:"fa fa-undo"})]):t._e(),t._v("\n            Similarity\n            "),t.needsSimilarityReference?n("p",[t._v("\n                Select a reference annotation with a click on the "),n("i",{staticClass:"fa fa-thumbtack fa-fw"}),t._v(" button.\n            ")]):t._e()])])])}),[],!1,null,null,null).exports;var D=n({props:{label:{type:Object,default:function(){return{}}}},computed:{title:function(){return"Annotations with label ".concat(this.label.name)},classObject:function(){return{selected:this.label.selected}},countTitle:function(){return"There are ".concat(this.count," annotations with label ").concat(this.label.name)},colorStyle:function(){return"background-color: #"+this.label.color},count:function(){return this.label.count}},methods:{emitSelectLabel:function(){this.labelItem.selected=!this.labelItem.selected,this.labelItem.selected?this.$emit("select",this.labelItem):this.$emit("deselect")}},created:function(){this.labelItem=this.label}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("li",{staticClass:"annotations-tab-item--largo",class:t.classObject,attrs:{title:t.title}},[n("div",{staticClass:"annotations-tab-item__title--largo",on:{click:t.emitSelectLabel}},[n("span",{staticClass:"pull-right badge",attrs:{title:t.countTitle},domProps:{textContent:t._s(t.count)}}),t._v(" "),n("span",{staticClass:"annotations-tab-item__color--largo",style:t.colorStyle}),t._v(" "),n("span",{domProps:{textContent:t._s(t.label.name)}})])])}),[],!1,null,null,null);const j={mixins:[m],components:{labelTrees:h,sidebar:v,sidebarTab:y,powerToggle:g,dismissImageGrid:I,relabelImageGrid:x,settingsTab:q,sortingTab:B,labelList:n({components:{labelItem:D.exports},props:{labels:{type:Array,default:function(){return[]}}},computed:{annotationBadgeCount:function(){return this.labels.reduce((function(t,e){return t+e.count}),0)}},methods:{handleSelectedLabel:function(t){this.$emit("select",t)},handleDeselectedLabel:function(){this.$emit("deselect")}}},undefined,undefined,!1,null,null,null).exports},data:function(){return{user:null,labelTrees:[],step:0,selectedLabel:null,annotationsCache:{},lastSelectedImage:null,forceChange:!1,waitForSessionId:null,showAnnotationOutlines:!0,sortingSequenceCache:{},sortingSequence:[],sortingDirection:E,sortingKey:R,needsSimilarityReference:!1,similarityReference:null,pinnedImage:null,labels:[],fetchedLabelCount:!1}},provide:function(){var t=this,e={};return Object.defineProperty(e,"showAnnotationOutlines",{get:function(){return t.showAnnotationOutlines}}),{outlines:e}},computed:{isInDismissStep:function(){return 0===this.step},isInRelabelStep:function(){return 1===this.step},annotations:function(){return this.selectedLabel&&this.annotationsCache.hasOwnProperty(this.selectedLabel.id)?this.annotationsCache[this.selectedLabel.id]:[]},sortedAnnotations:function(){var t=this.annotations;if(0===t.length)return t;if(this.sortingSequence.length>0){var n={};t.forEach((function(t){n[t.type===e?"v"+t.id:"i"+t.id]=t})),t=this.sortingSequence.map((function(t){return n[t]}))}return this.sortingDirection===$?t.slice().reverse():t},allAnnotations:function(){var t=[];for(var e in this.annotationsCache)this.annotationsCache.hasOwnProperty(e)&&(t=t.concat(this.annotationsCache[e]));return t},hasNoAnnotations:function(){return this.selectedLabel&&!this.loading&&0===this.annotations.length},dismissedAnnotations:function(){return this.allAnnotations.filter((function(t){return t.dismissed}))},annotationsWithNewLabel:function(){return this.dismissedAnnotations.filter((function(t){return!!t.newLabel}))},hasDismissedAnnotations:function(){return this.dismissedAnnotations.length>0},dismissedImageAnnotationsToSave:function(){return this.packDismissedToSave(this.dismissedAnnotations.filter((function(e){return e.type===t})))},dismissedVideoAnnotationsToSave:function(){return this.packDismissedToSave(this.dismissedAnnotations.filter((function(t){return t.type===e})))},changedImageAnnotationsToSave:function(){return this.packChangedToSave(this.annotationsWithNewLabel.filter((function(e){return e.type===t})))},changedVideoAnnotationsToSave:function(){return this.packChangedToSave(this.annotationsWithNewLabel.filter((function(t){return t.type===e})))},toDeleteCount:function(){return this.dismissedAnnotations.length-this.annotationsWithNewLabel.length},saveButtonClass:function(){return this.forceChange?"btn-danger":"btn-success"},sortingIsActive:function(){return this.isInDismissStep&&(this.sortingKey!==R||this.sortingDirection!==E)},imagesPinnable:function(){return this.needsSimilarityReference||this.sortingKey===P},labelTreesIndex:function(){var t={};return this.labelTrees.forEach((function(e,n){t[e.id]={index:n,labels:{}},e.labels.forEach((function(n,i){t[e.id].labels[n.id]=i}))})),t}},methods:{getAnnotations:function(t){var e,n,i=this;this.annotationsCache.hasOwnProperty(t.id)?e=Vue.Promise.resolve():(Vue.set(this.annotationsCache,t.id,[]),this.startLoading(),e=this.queryAnnotations(t).then((function(e){return i.gotAnnotations(t,e)}),l)),this.sortingKey===P?n=this.resetSorting():this.sortingIsActive?(this.sortingSequence=[],n=this.updateSortKey(this.sortingKey)):n=Vue.Promise.resolve(),Vue.Promise.all([e,n]).finally(this.finishLoading)},gotAnnotations:function(n,i){var s=i[0].data,o=i[1].data,a=[];s&&(a=a.concat(this.initAnnotations(n,s,t))),o&&(a=a.concat(this.initAnnotations(n,o,e))),a=a.sort((function(t,e){return e.id-t.id})),Vue.set(this.annotationsCache,n.id,a)},initAnnotations:function(t,e,n){return Object.keys(e).map((function(i){return{id:i,uuid:e[i],label_id:t.id,dismissed:!1,newLabel:null,type:n}}))},handleSelectedLabel:function(t){this.selectedLabel=t,this.isInDismissStep&&this.getAnnotations(t)},handleDeselectedLabel:function(){this.selectedLabel=null},handleSelectedImageDismiss:function(t,e){t.dismissed?(t.dismissed=!1,t.newLabel=null):(t.dismissed=!0,e.shiftKey&&this.lastSelectedImage?this.dismissAllImagesBetween(t,this.lastSelectedImage):this.lastSelectedImage=t)},goToRelabel:function(){this.step=1,this.lastSelectedImage=null},goToDismiss:function(){this.step=0,this.lastSelectedImage=null,this.selectedLabel&&this.getAnnotations(this.selectedLabel)},handleSelectedImageRelabel:function(t,e){t.newLabel?this.selectedLabel&&t.newLabel.id!==this.selectedLabel.id?t.newLabel=this.selectedLabel:t.newLabel=null:this.selectedLabel&&(t.newLabel=this.selectedLabel,e.shiftKey&&this.lastSelectedImage?this.relabelAllImagesBetween(t,this.lastSelectedImage):this.lastSelectedImage=t)},save:function(){var t=this;if(!this.loading){if(this.toDeleteCount>0){for(var e;null!==e&&parseInt(e,10)!==this.toDeleteCount;)e=prompt("This might delete ".concat(this.toDeleteCount," annotation(s). Please enter the number to continue."));if(null===e)return}this.startLoading(),this.performSave({dismissed_image_annotations:this.dismissedImageAnnotationsToSave,changed_image_annotations:this.changedImageAnnotationsToSave,dismissed_video_annotations:this.dismissedVideoAnnotationsToSave,changed_video_annotations:this.changedVideoAnnotationsToSave,force:this.forceChange}).then((function(e){t.waitForSessionId=e.body.id,t.resetLabelCount()}),(function(e){t.finishLoading(),l(e)}))}},handleSessionSaved:function(t){if(t.id==this.waitForSessionId){for(var e in this.finishLoading(),f.success("Saved. You can now start a new re-evaluation session."),this.step=0,this.annotationsCache)this.annotationsCache.hasOwnProperty(e)&&delete this.annotationsCache[e];for(var n in this.sortingSequenceCache)this.sortingSequenceCache.hasOwnProperty(n)&&delete this.sortingSequenceCache[n];this.handleSelectedLabel(this.selectedLabel)}},handleSessionFailed:function(t){t.id==this.waitForSessionId&&(this.finishLoading(),f.danger("There was an unexpected error."))},dismissAllImagesBetween:function(t,e){var n=this.sortedAnnotations.indexOf(t),i=this.sortedAnnotations.indexOf(e);if(i<n){var s=i;i=n,n=s}for(var o=n+1;o<i;o++)this.sortedAnnotations[o].dismissed=!0},relabelAllImagesBetween:function(t,e){var n=this.selectedLabel,i=this.allAnnotations.indexOf(t),s=this.allAnnotations.indexOf(e);if(s<i){var o=s;s=i,i=o}for(var a=i+1;a<s;a++)this.allAnnotations[a].dismissed&&(this.allAnnotations[a].newLabel=n)},enableForceChange:function(){this.forceChange=!0},disableForceChange:function(){this.forceChange=!1},packDismissedToSave:function(t){for(var e={},n=t.length-1;n>=0;n--)e.hasOwnProperty(t[n].label_id)?e[t[n].label_id].push(t[n].id):e[t[n].label_id]=[t[n].id];return e},packChangedToSave:function(t){for(var e={},n=t.length-1;n>=0;n--)e.hasOwnProperty(t[n].newLabel.id)?e[t[n].newLabel.id].push(t[n].id):e[t[n].newLabel.id]=[t[n].id];return e},initializeEcho:function(){a.getInstance().private("user-".concat(this.user.id)).listen(".Biigle\\Modules\\Largo\\Events\\LargoSessionSaved",this.handleSessionSaved).listen(".Biigle\\Modules\\Largo\\Events\\LargoSessionFailed",this.handleSessionFailed)},updateShowOutlines:function(t){this.showAnnotationOutlines=t},updateSortDirection:function(t){this.sortingDirection=t},fetchSortingSequence:function(t,e){var n,i,s,o=this,a=null===(n=this.sortingSequenceCache)||void 0===n||null===(i=n[e])||void 0===i?void 0:i[t];if(a)return Vue.Promise.resolve(a);if(this.selectedLabel)if(t===k)s=this.querySortByOutlier(e).then((function(t){return t.body}));else{if(t===P)return this.querySortBySimilarity(e,this.similarityReference).then((function(t){return t.body}));s=Vue.Promise.resolve([])}else s=Vue.Promise.resolve([]);return s.then((function(n){return o.putSortingSequenceToCache(t,e,n)}))},putSortingSequenceToCache:function(t,e,n){return this.sortingSequenceCache[e]||Vue.set(this.sortingSequenceCache,e,{}),this.sortingSequenceCache[e][t]=n,n},updateSortKey:function(t){var e,n=this;t!==P&&(this.similarityReference=null,this.pinnedImage=null);var i=null===(e=this.selectedLabel)||void 0===e?void 0:e.id;return this.startLoading(),this.fetchSortingSequence(t,i).then((function(e){n.sortingKey=t,n.sortingSequence=e,t===P&&(n.needsSimilarityReference=!1,n.pinnedImage=n.similarityReference)})).catch((function(t){n.handleErrorResponse(t),n.similarityReference=null})).finally(this.finishLoading)},handleInitSimilaritySort:function(){this.sortingKey!==P&&(this.needsSimilarityReference=!0)},handleCancelSimilaritySort:function(){this.needsSimilarityReference=!1},handlePinImage:function(t){var e;(null===(e=this.pinnedImage)||void 0===e?void 0:e.id)===t.id?this.resetSorting():this.imagesPinnable&&(this.similarityReference=t,this.updateSortKey(P))},resetSorting:function(){var t=this;return this.updateSortKey(R).then((function(){return t.sortingDirection=E}))},handleOpenTab:function(t){"label-list"!==t||this.fetchedLabelCount||this.getLabelCount()},getLabelCount:function(){this.startLoading(),this.fetchLabelCount().then(this.parseResponse).catch(l).finally(this.finishLoading)},parseResponse:function(t){var e=this;this.labels=t.body.reduce((function(t,n){if(e.labelTreesIndex.hasOwnProperty(n.label_tree_id)){var i=e.labelTreesIndex[n.label_tree_id].index,s=e.labelTreesIndex[n.label_tree_id].labels[n.id],o=e.labelTrees[i].labels[s];o.count=n.count,t.push(o)}else n.selected=!1,t.push(n);return t}),[]),this.fetchedLabelCount=!0},resetLabelCount:function(){this.fetchedLabelCount=!1,this.labels=[]}},watch:{annotations:function(t){r.$emit("annotations-count",t.length)},dismissedAnnotations:function(t){r.$emit("dismissed-annotations-count",t.length)},step:function(t){r.$emit("step",t)},selectedLabel:function(t,e){this.isInDismissStep&&this.$refs.dismissGrid.setOffset(0),null!=e&&e.selected&&(e.selected=!1)}},created:function(){var t=this;this.user=biigle.$require("largo.user"),window.addEventListener("beforeunload",(function(e){if(t.hasDismissedAnnotations)return e.preventDefault(),e.returnValue="","This page is asking you to confirm that you want to leave - data you have entered may not be saved."})),this.initializeEcho()}};const V=n(j,undefined,undefined,!1,null,null,null).exports;const G=n({mixins:[V],components:{catalogImageGrid:_},data:function(){return{labelTrees:[]}},methods:{queryAnnotations:function(t){var e=C.queryImageAnnotations({id:t.id}),n=C.queryVideoAnnotations({id:t.id});return Vue.Promise.all([e,n])},showOutlines:function(){this.showAnnotationOutlines=!0},hideOutlines:function(){this.showAnnotationOutlines=!1}},created:function(){var t=biigle.$require("annotationCatalog.labelTree");this.labelTrees=[t],this.showAnnotationOutlines=!1}},undefined,undefined,!1,null,null,null).exports;const K=n({mixins:[V],data:function(){return{volumeId:null,labelTrees:[],mediaType:""}},methods:{queryAnnotations:function(t){var e,n;return"image"===this.mediaType?(e=o.queryImageAnnotations({id:this.volumeId,label_id:t.id}),n=Vue.Promise.resolve([])):(e=Vue.Promise.resolve([]),n=o.queryVideoAnnotations({id:this.volumeId,label_id:t.id})),Vue.Promise.all([e,n])},performSave:function(t){return o.save({id:this.volumeId},t)},querySortByOutlier:function(t){return o.sortAnnotationsByOutlier({id:this.volumeId,label_id:t}).then(this.parseSortingQuery)},querySortBySimilarity:function(t,e){return o.sortAnnotationsBySimilarity({id:this.volumeId,label_id:t,annotation_id:e.id}).then(this.parseSortingQuery)},parseSortingQuery:function(t){return"image"===this.mediaType?t.body=t.body.map((function(t){return"i"+t})):t.body=t.body.map((function(t){return"v"+t})),t},fetchLabelCount:function(){return o.fetchVolumeAnnotationLabelCount({id:this.volumeId})}},created:function(){this.volumeId=biigle.$require("largo.volumeId"),this.labelTrees=biigle.$require("largo.labelTrees"),this.mediaType=biigle.$require("largo.mediaType")}},undefined,undefined,!1,null,null,null).exports;const U=n({data:function(){return{step:0,count:0,dismissedCount:0}},computed:{shownCount:function(){return this.isInDismissStep?this.count:this.dismissedCount},isInDismissStep:function(){return 0===this.step},isInRelabelStep:function(){return 1===this.step}},methods:{updateStep:function(t){this.step=t},updateCount:function(t){this.count=t},updateDismissedCount:function(t){this.dismissedCount=t}},created:function(){r.$on("annotations-count",this.updateCount),r.$on("dismissed-annotations-count",this.updateDismissedCount),r.$on("step",this.updateStep)}},undefined,undefined,!1,null,null,null).exports,N=Vue.resource("api/v1/projects{/id}/largo",{},{queryImageAnnotations:{method:"GET",url:"api/v1/projects{/id}/image-annotations/filter/label{/label_id}"},queryVideoAnnotations:{method:"GET",url:"api/v1/projects{/id}/video-annotations/filter/label{/label_id}"},sortAnnotationsByOutlier:{method:"GET",url:"api/v1/projects{/id}/annotations/sort/outliers{/label_id}"},sortAnnotationsBySimilarity:{method:"GET",url:"api/v1/projects{/id}/annotations/sort/similarity"},fetchProjectAnnotationLabelCount:{method:"GET",url:"api/v1/projects{/id}/label-count"}});const F=n({mixins:[V],data:function(){return{projectId:null,labelTrees:[]}},methods:{queryAnnotations:function(t){var e=N.queryImageAnnotations({id:this.projectId,label_id:t.id}),n=N.queryVideoAnnotations({id:this.projectId,label_id:t.id});return Vue.Promise.all([e,n])},performSave:function(t){return N.save({id:this.projectId},t)},querySortByOutlier:function(t){return N.sortAnnotationsByOutlier({id:this.projectId,label_id:t})},querySortBySimilarity:function(e,n){var i={id:this.projectId,label_id:e};return n.type===t?i.image_annotation_id=n.id:i.video_annotation_id=n.id,N.sortAnnotationsBySimilarity(i)},fetchLabelCount:function(){return N.fetchProjectAnnotationLabelCount({id:this.projectId})}},created:function(){this.projectId=biigle.$require("largo.projectId"),this.labelTrees=biigle.$require("largo.labelTrees")}},undefined,undefined,!1,null,null,null).exports;biigle.$mount("annotation-catalog-container",G),biigle.$mount("largo-container",K),biigle.$mount("largo-title",U),biigle.$mount("project-largo-container",F)},307:()=>{}},n={};function i(t){var s=n[t];if(void 0!==s)return s.exports;var o=n[t]={exports:{}};return e[t](o,o.exports,i),o.exports}i.m=e,t=[],i.O=(e,n,s,o)=>{if(!n){var a=1/0;for(c=0;c<t.length;c++){for(var[n,s,o]=t[c],r=!0,l=0;l<n.length;l++)(!1&o||a>=o)&&Object.keys(i.O).every((t=>i.O[t](n[l])))?n.splice(l--,1):(r=!1,o<a&&(a=o));if(r){t.splice(c--,1);var u=s();void 0!==u&&(e=u)}}return e}o=o||0;for(var c=t.length;c>0&&t[c-1][2]>o;c--)t[c]=t[c-1];t[c]=[n,s,o]},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{var t={355:0,392:0};i.O.j=e=>0===t[e];var e=(e,n)=>{var s,o,[a,r,l]=n,u=0;if(a.some((e=>0!==t[e]))){for(s in r)i.o(r,s)&&(i.m[s]=r[s]);if(l)var c=l(i)}for(e&&e(n);u<a.length;u++)o=a[u],i.o(t,o)&&t[o]&&t[o][0](),t[o]=0;return i.O(c)},n=self.webpackChunkbiigle_largo=self.webpackChunkbiigle_largo||[];n.forEach(e.bind(null,0)),n.push=e.bind(null,n.push.bind(n))})(),i.O(void 0,[392],(()=>i(456)));var s=i.O(void 0,[392],(()=>i(307)));s=i.O(s)})();