/*jshint esversion: 6 */

/*
  CLASSE AskomicsUserAbstraction
  Manage Abstraction storing in the TPS.
*/
var AskomicsUserAbstraction = function () {
    'use strict';
    const prefix = {
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',
      'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
      'owl': 'http://www.w3.org/2002/07/owl#'
    };
    /* Ontology is save locally to avoid request with TPS  */
    /* --------------------------------------------------- */
    var tripletSubjectRelationObject = [];
    var entityInformationList = {};
    var attributesEntityList = {};
    var categoriesEntityList = {};
    /*
    load ontology
    see template SPARQL to know sparql variable
    */
    /* Request information in the model layer */
    //this.updateOntology();
    AskomicsUserAbstraction.prototype.loadUserAbstraction = function(uriEntity) {
    //  $('#waitModal').modal('show');
    //AskomicsUserAbstraction.prototype.updateOntology = function() {
      var service = new RestServiceJs("userAbstraction");

      service.postsync({}, function(resultListTripletSubjectRelationObject ) {
      console.log("========================= ABSTRACTION =====================================================================");
      for (var elt in resultListTripletSubjectRelationObject) {
        console.log("*            "+ elt + "                      * ");
        console.log("  == >  "+JSON.stringify(resultListTripletSubjectRelationObject[elt]));
      }
        /* All relation are stored in tripletSubjectRelationObject */
        tripletSubjectRelationObject = resultListTripletSubjectRelationObject.relations;
        entityInformationList = {};
        /* All information about an entity available in TPS are stored in entityInformationList */
        for (var entry in resultListTripletSubjectRelationObject.entities){

          var uri = resultListTripletSubjectRelationObject.entities[entry].entity;
          var rel = resultListTripletSubjectRelationObject.entities[entry].property;
          var val = resultListTripletSubjectRelationObject.entities[entry].value;

          if ( ! (uri in entityInformationList) ) {
              entityInformationList[uri] = {};
          }
          entityInformationList[uri][rel] = val;
        }
        var attribute = {};
        
	for (var entry2 in resultListTripletSubjectRelationObject.attributes){
          console.log("ATTRIBUTE:"+JSON.stringify(resultListTripletSubjectRelationObject.attributes[entry2]));
          var uri2 = resultListTripletSubjectRelationObject.attributes[entry2].entity;
          attribute = {};
          attribute.uri  = resultListTripletSubjectRelationObject.attributes[entry2].attribute;
          attribute.label = resultListTripletSubjectRelationObject.attributes[entry2].labelAttribute;
          attribute.type  = resultListTripletSubjectRelationObject.attributes[entry2].typeAttribute;

          if ( ! (uri2 in attributesEntityList) ) {
              attributesEntityList[uri2] = [];
          }

          attributesEntityList[uri2].push(attribute);
          //TODO Force label in the first position to print the label at the first position
        }

        for (var entry3 in resultListTripletSubjectRelationObject.categories){
          console.log("CATEGORY:"+JSON.stringify(resultListTripletSubjectRelationObject.categories[entry3]));
          var uri3 = resultListTripletSubjectRelationObject.categories[entry3].entity;
          attribute = {};
          attribute.uri  = resultListTripletSubjectRelationObject.categories[entry3].category;
          attribute.label = resultListTripletSubjectRelationObject.categories[entry3].labelCategory;
          attribute.type  = resultListTripletSubjectRelationObject.categories[entry3].typeCategory;

          if ( ! (uri3 in attributesEntityList) ) {
              attributesEntityList[uri3] = [];
          }

          attributesEntityList[uri3].push(attribute);
          //TODO Force label in the first position to print the label at the first position
        }

        console.log("==============================================================================================");
        console.log("<=== entityInformationList ===> ");
        console.log(JSON.stringify(entityInformationList));
        //$('#waitModal').modal('hide');
      });
    };

    /* Get value of an attribut with RDF format like rdfs:label */
    AskomicsUserAbstraction.prototype.removePrefix = function(uriEntity) {
      var idx =  uriEntity.indexOf("#");
      if ( idx == -1 ) {
        idx =  uriEntity.indexOf(":");
        if ( idx == -1 ) return;
      }
      uriEntity = uriEntity.substr(idx+1,uriEntity.length);
      return uriEntity;
    };

    AskomicsUserAbstraction.prototype.URI = function(uriEntity) {
      if ( uriEntity.indexOf("#")>0 ) {
        return '<'+uriEntity+">";
      }
      return uriEntity;
    };

    /* Get value of an attribut with RDF format like rdfs:label */
    AskomicsUserAbstraction.prototype.getAttrib = function(uriEntity,attrib) {
        if (!(uriEntity in entityInformationList)) {
          console.error(JSON.stringify(uriEntity) + " is not referenced in the user abstraction !");
          return;
        }
        var attrib_longterm = attrib ;
        for (var p in prefix) {
          var i = attrib_longterm.search(p+":");
          if ( i != - 1) {
            attrib_longterm = attrib_longterm.replace(p+":",prefix[p]);
            break;
          }
        }

        if (!(attrib_longterm in entityInformationList[uriEntity])) {
          console.error(JSON.stringify(uriEntity) + '['+JSON.stringify(attrib)+']' + " is not referenced in the user abstraction !");
          return;
        }
        return entityInformationList[uriEntity][attrib_longterm];
    };

    /* build node from user abstraction infomation */
    AskomicsUserAbstraction.prototype.buildBaseNode  = function(uriEntity) {
      var node = {
        uri   : uriEntity,
        label : this.getAttrib(uriEntity,'rdfs:label')
      } ;
      return node;
    };


    /*
    Get
    - relations with UriSelectedNode as a subject or object
    - objects link with Subject UriSelectedNode
    - Subjects link with Subject UriSelectedNode
     */

    AskomicsUserAbstraction.prototype.getRelationsObjectsAndSubjectsWithURI = function(UriSelectedNode) {
      console.log('getRelationsFromSubject '+UriSelectedNode);
      console.log('tripletSubjectRelationObject '+JSON.stringify(tripletSubjectRelationObject));

      var objectsTarget = {} ;
      var subjectsTarget = {} ;

      for (var i in tripletSubjectRelationObject) {
        if ( tripletSubjectRelationObject[i].object == UriSelectedNode ) {
          if (! (tripletSubjectRelationObject[i].subject in subjectsTarget) ) {
            subjectsTarget[tripletSubjectRelationObject[i].subject] = [];
          }
          subjectsTarget[tripletSubjectRelationObject[i].subject].push(tripletSubjectRelationObject[i].relation);
        }
        if ( tripletSubjectRelationObject[i].subject == UriSelectedNode ) {
          if (! (tripletSubjectRelationObject[i].object in objectsTarget) ) {
            objectsTarget[tripletSubjectRelationObject[i].object] = [];
          }
          objectsTarget[tripletSubjectRelationObject[i].object].push(tripletSubjectRelationObject[i].relation);
        }
      }
      // TODO: Manage Doublons and remove it....

      return [objectsTarget, subjectsTarget];
    };

    /* return a list of attributes according a uri node */
    AskomicsUserAbstraction.prototype.getAttributesWithURI  = function(UriSelectedNode) {
      return attributesEntityList[UriSelectedNode];
    };


  };
