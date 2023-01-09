import traceback
import jadn

class ConversionLogic(object):

    def convertToHTML(self, schema):
        conv = ''

        try:
            conv = jadn.convert.html_dumps(schema)
        except:
            tb = traceback.format_exc()
            print(tb)
            conv = "Error: " + tb

        return conv;  

    def convertToGraphViz(self, schema):
        conv = ''

        # TODO: Not in pypkg?
        # try:
        #     conv = jadn.load(schema)
        # except:
        #     tb = traceback.format_exc()
        #     print(tb)
        #     conv = "Error: " + tb

        return conv; 

    def convertToJADN(self, schema):
        conv = ''

        try:
            conv = jadn.load(schema)
        except:
            tb = traceback.format_exc()
            print(tb)
            conv = "Error: " + tb

        return conv;        

    def convertToJIDL(self, schema):
        conv = ''

        try:
            conv = jadn.convert.jidl_dumps(schema)
        except:
            tb = traceback.format_exc()
            print(tb)
            conv = "Error: " + tb

        return conv;

    def convertToMarkDown(self, schema):
        conv = ''

        # TODO: Not in pypkg?
        # try:
        #     conv = jadn.load(schema)
        # except:
        #     tb = traceback.format_exc()
        #     print(tb)
        #     conv = "Error: " + tb

        return conv;        

    def convertToRelax(self, schema):
        conv = ''

        # TODO: Not in pypkg?
        # try:
        #     conv = jadn.load(schema)
        # except:
        #     tb = traceback.format_exc()
        #     print(tb)
        #     conv = "Error: " + tb

        return conv;          