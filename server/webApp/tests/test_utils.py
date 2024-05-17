from unittest import TestCase

from server.webApp.utils.utils import convert_json_to_cbor


class TestUtils(TestCase):
    
    global_data = {}
    
    def setUp(self):
        test_json = { 'test' : 'test'}
        test_cbor_str = { 'test' : 'test'}
        
    def test_convert_json_to_cbor(self):
        test = convert_json_to_cbor(self.global_data)
        
        cbor_str = test.decode("utf-8")
        print("cbor: " + cbor_str)
        
        assert test != None
        
    def test_convert_cbor_to_json(self):
        test = convert_json_to_cbor(self.global_data)
        
        print(test)
        
        assert test != None         