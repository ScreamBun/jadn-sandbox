from unittest import TestCase

from server.webApp.utils import utils


class TestUtils(TestCase):
    
    global_data = {}
    test_cbor_hex_str = ""
    
    def setUp(self):
        self.test_cbor_hex_str = "A266616374696F6E6464656E7966746172676574A16D69705F636F6E6E656374696F6EA5686473745F616464727827323030313A306462383A383561333A303030303A303030303A386132653A303337303A38393131686473745F706F72746568747470736870726F746F636F6C63746370687372635F616464727827323030313A306462383A383561333A303030303A303030303A386132653A303337303A37333334687372635F706F7274653130393936" 
        self.test_json = { 'test' : 'test'}
        self.test_cbor_str = { 'test' : 'test'}
        
    def test_convert_json_to_cbor(self):
        test = utils.convert_json_to_cbor(self.global_data)
        
        cbor_str = test.decode("utf-8")
        print("cbor: " + cbor_str)
        
        assert test != None
        
    def test_convert_cbor_to_json(self):
        test = utils.convert_cbor_to_Json(self.test_cbor_hex_str)
        
        print(test)
        
        assert test != None         