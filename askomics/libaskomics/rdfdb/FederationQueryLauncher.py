#! /usr/bin/env python
# -*- coding: utf-8 -*-
import os, time, tempfile
import re
import csv
from pprint import pformat
from SPARQLWrapper import SPARQLWrapper, JSON
import requests
import logging
import urllib.request

from askomics.libaskomics.rdfdb.QueryLauncher import QueryLauncher

class FederationQueryLauncher(QueryLauncher):
    """
    The QueryLauncher process sparql queries:
        - execute_query send the query to the sparql endpoint specified in params.
        - parse_results preformat the query results
        - format_results_csv write in the tabulated result file a table obtained
          from these preformated results using a ResultsBuilder instance.
    """

    def __init__(self, settings, session, list_endpoints):
        QueryLauncher.__init__(self, settings, session)
        self.log = logging.getLogger(__name__)


        self.log.debug(" =================== Federation Request ====================")

        # comments added in sparql request to get all url endpoint.
        if self.settings['askomics.federation_engine'] == "corese":
            self.federation_header = "@trap@federate\n"  # @trap ignore results parsing errors and write it in Corese logs
            for endpoint in list_endpoints:
                self.federation_header += "<" + endpoint['endpoint'] + ">\n"

        if self.settings['askomics.federation_engine'] == "fedx":
            self.federation_header = ""
            for endpoint in list_endpoints:
                if 'askomics' not in endpoint:
                   raise ValueError("endpoint var have to defined an 'askomics' key with a boolean value endpoint = " + str(endpoint))
                if endpoint['askomics']:
                   self.federation_header += "#endpoint,askomics," + endpoint['name'] + ',' + endpoint['endpoint'] + ',false\n'
                else:
                   self.federation_header += "#endpoint,external," + endpoint['name'] + ',' + endpoint['endpoint'] + ',false\n' 
            #add local TPS
            #self.federation_header += "#endpoint,local," + self.get_param("askomics.endpoint") + ',false\n'

        if not self.is_defined("askomics.federation_url") :
            raise ValueError("can not find askomics.federation_url property in the config file !")

        self.name = 'FederationEngine'
        self.endpoint = self.get_param("askomics.federation_url")
        self.username = None
        self.password = None
        self.urlupdate = None
        self.auth = 'Basic'
        self.allowUpdate = False

    def process_query(self, query):
        '''
            Execute query and parse the results if exist
        '''
        self.log.debug("================================================================================")
        self.log.debug(" =================== Federation Request : process_query  ====================")
        self.log.debug("================================================================================")

        # Federation Request case
        #------------------------------------------------------
        query = self.federation_header + query
        json_query = self._execute_query(query, log_raw_results=False)
        return self.parse_results(json_query)
