"""contain FederationQueryLauncher Class"""

import unittest
import os.path

from pyramid.paster import get_appsettings
from pyramid import testing
from askomics.libaskomics.rdfdb.FederationQueryLauncher import FederationQueryLauncher
from askomics.libaskomics.EndpointManager import EndpointManager
from interface_tps_db import InterfaceTpsDb
from SetupTests import SetupTests

class FederationQueryLauncherTests(unittest.TestCase):
    """Test for the FederationQueryLauncher class"""

    def setUp(self):
        """Set up the settings and session"""

        self.settings = get_appsettings('configs/tests.ini', name='main')
        self.settings['askomics.upload_user_data_method'] = 'insert'

        self.request = testing.DummyRequest()
        self.request.session['username'] = 'jdoe'
        self.request.session['group'] = 'base'
        self.request.session['admin'] = False
        self.request.session['blocked'] = False

        self.request.session['graph'] = "test/nosetest/jdoe"
        SetupTests(self.settings, self.request.session)
        self.tps = InterfaceTpsDb(self.settings, self.request)


    def test_process_query(self):

        # FedX
        self.settings['askomics.federation_engine'] = 'fedx'
        self.settings['askomics.federation_url'] = 'http://localhost:4040/fedx'

        self.tps.clean_up()
        timestamp_people = self.tps.load_people()
        bck = self.settings['askomics.endpoint']
        self.settings['askomics.endpoint'] = 'http://localhost:8891/sparql'
        self.tps.clean_up()
        timestamp_people2 = self.tps.load_people2()
        self.settings['askomics.endpoint'] = bck

        self.tps.add_askoko_in_endpoint()

        list_endpoints = [{
            'name': 'endpoint1',
            'endpoint': 'http://localhost:8891/sparql',
            'askomics': True,
            'auth': 'Basic',
            'username': None,
            'password': None
        }, {
              'name': 'endpoint2',
              'endpoint': 'http://localhost:8890/sparql',
              'askomics': True,
              'auth': 'Basic',
              'username': None,
              'password': None
        }]

        federation = FederationQueryLauncher(self.settings, self.request.session, list_endpoints)


        # Corese
        self.settings['askomics.federation_engine'] = 'corese'
        self.settings['askomics.federation_url'] = 'http://localhost:5050'

        self.tps.clean_up()
        timestamp_people = self.tps.load_people()
        bck = self.settings['askomics.endpoint']
        self.settings['askomics.endpoint'] = 'http://localhost:8891/sparql'
        self.tps.clean_up()
        timestamp_people2 = self.tps.load_people2()
        self.settings['askomics.endpoint'] = bck

        self.tps.add_askoko_in_endpoint()

        list_endpoints = [{
            'name': 'endpoint1',
            'endpoint': 'http://localhost:8891/sparql',
            'askomics': True,
            'auth': 'Basic',
            'username': None,
            'password': None
        }, {
              'name': 'endpoint2',
              'endpoint': 'http://localhost:8890/sparql',
              'askomics': True,
              'auth': 'Basic',
              'username': None,
              'password': None
        }]

        federation = FederationQueryLauncher(self.settings, self.request.session, list_endpoints)

