import logging

from unittest import TestCase

import pytest
from flask import current_app, Flask

from server.webApp.utils import utils


class TestUtils(TestCase):
    
    global_data = {}
    
    
    def setUp(self):
        self.test_cbor_hex_str_1 = "A266616374696F6E6464656E7966746172676574A16D69705F636F6E6E656374696F6EA5686473745F616464727827323030313A306462383A383561333A303030303A303030303A386132653A303337303A38393131686473745F706F72746568747470736870726F746F636F6C63746370687372635F616464727827323030313A306462383A383561333A303030303A303030303A386132653A303337303A37333334687372635F706F7274653130393936" 
        self.test_cbor_hex_str_2 = 'a261316568656c6c6f6132a16133657468657265' 
        self.test_json_1 = {
                            'action': 'deny', 
                            'target': {
                                'ip_connection': {
                                    'dst_addr': '2001:0db8:85a3:0000:0000:8a2e:0370:8911', 
                                    'dst_port': 'https', 
                                    'protocol': 'tcp', 
                                    'src_addr': '2001:0db8:85a3:0000:0000:8a2e:0370:7334', 
                                    'src_port': '10996'}
                                }
                            }
        self.test_json_2 = {
                                    1 : 'hello',
                                    2 : {
                                        3 : 'there'
                                    }
                               }
        
    def test_convert_json_to_cbor_str(self):  
        cbor_str = utils.convert_json_to_cbor_str(self.test_json_2)
        
        print("cbor str: " + cbor_str)
        logging.info("cbor: " + cbor_str)
        
        assert cbor_str != None
    
        
    def test_convert_cbor_str_to_json(self):
        diag_str = utils.convert_cbor_str_to_json(self.test_cbor_hex_str_1)
        
        print("cbor diag: " + diag_str)
        logging.info("cbor diag: " + diag_str)
        
        assert diag_str != None
    
        
    def test_convert_cbor_to_annotated_view(self):
        annotated_view = utils.convert_cbor_to_annotated_view("")

        print("cbor annotated: " + annotated_view)
        logging.info("cbor annotated: " + annotated_view)

        assert annotated_view != None  