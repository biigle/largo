angular.module("biigle.project-largo",["biigle.largo"]),angular.module("biigle.project-largo").config(["$compileProvider",function(e){"use strict";e.debugInfoEnabled(!1)}]),angular.module("biigle.project-largo").factory("Largo",["$resource","URL",function(e,r){"use strict";return e(r+"/api/v1/projects/:project_id/largo")}]),angular.module("biigle.project-largo").factory("ProjectFilterAnnotationLabel",["$resource","URL",function(e,r){"use strict";return e(r+"/api/v1/projects/:project_id/annotations/filter/label/:label_id")}]),angular.module("biigle.project-largo").service("largo",["PROJECT_ID","ProjectFilterAnnotationLabel","Largo",function(e,r,o){"use strict";this.getAnnotations=function(o){return r.query({project_id:e,label_id:o})},this.save=function(r,t){return o.save({project_id:e},{dismissed:r,changed:t})}}]);