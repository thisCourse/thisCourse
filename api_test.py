import httplib, json

server_address = "127.0.0.1:3000"
base_url = "/api"

class Request(object):

    def __init__(self, path, method="GET", data=None, headers={}):
        self.data = data
        if not data is None:
            data = json.dumps(data)
            headers["content-type"] = "application/json"
        self.server = httplib.HTTPConnection(server_address)
        self.server.request(method, base_url + path, body=data, headers=headers)
        self.response = self.server.getresponse()
        body = self.response.read()
        self.body = json.loads(body or "{}")
        self.server.close()
    
    def contains(self, obj):
        if isinstance(self.body, list):
            assert obj in self.body, "The response array %r did not contain item %r." % (self.body, obj)
        else:
            assert subset_of(obj, self.body), "The response object %r did not contain %r." % (self.body, obj)
        return self

    def equals(self, obj):
        assert subset_of(obj, self.body, fields_to_ignore=["_id"]), "The objects were not equal (response object %r did not contain %r)." % (self.body, obj)
        assert subset_of(self.body, obj, fields_to_ignore=["_id"]), "The objects were not equal (specified object %r did not contain the response object %r)." % (obj, self.body)
        return self

    def status(self, status):
        assert self.response.status == status, "The response status was %d, but should have been %d." % (self.response.status, status)
        return self

    def attrval(self, attr, val):
        assert self.body.get(attr, None) == val, "The response's field %r was %r instead of %r." % (attr, self.body[attr], val)
        return self

    def hasfield(self, attr):
        assert attr in self.body, "The response did not have field %r." % (attr)
        return self

    def attrval_notequal(self, attr, val):
        assert self.body[attr] != val, "The response's %r field was equal to %r, but should have been different." % (attr, val)
        return self
    
    def id_changed(self):
        if self.data and "_id" in self.data:
            self.attrval_notequal("_id", self.data["_id"])
        return self

    def id_same(self):
        assert "_id" in self.data, "There was no id to begin with."
        assert self.attrval("_id", self.data["_id"]), "The id should have stayed the same, but it changed."
    
    def __repr__(self):
        return str(self.body)
    
def get(path, headers={}):
    return Request(path, method="GET", headers=headers)

def post(path, data=None, headers={}):
    return Request(path, method="POST", data=data, headers=headers)

def put(path, data=None, headers={}):
    return Request(path, method="PUT", data=data, headers=headers)

def delete(path, headers={}):
    return Request(path, method="DELETE", headers=headers)

def subset_of(obj1, obj2, fields_to_ignore=[]):
    
    if type(obj1)==str:
        obj1 = unicode(obj1)

    if type(obj2)==str:
        obj2 = unicode(obj2)

    if type(obj1) != type(obj2):
        return False
    
    if type(obj1) in [int, float, long, unicode]:
        return obj1==obj2
    
    if type(obj1) == list:
        if len(obj1) != len(obj2):
            return False
        for a,b in zip(obj1, obj2):
            if not subset_of(a, b, fields_to_ignore=fields_to_ignore):
                return False
        return True
    
    if type(obj1) == dict:
        for k in obj1.keys():
            if k in fields_to_ignore:
                continue
            if k not in obj2:
                return False
            elif not subset_of(obj1[k],obj2[k], fields_to_ignore=fields_to_ignore):
                return False
        return True
    
    raise Exception("Cannot compare instances of %r!" % type(obj1))
    
    
def print_request_type_headers():
    for method in ["POST", "PUT"]:
        for targettype in ["collection", "document", "array", "object", "value"]:
            for bodytype in ["object", "array", "value"]:
                print "#def test_%s_%s_onto_%s(self):\n    " % (method.lower(), bodytype, targettype)
                
    for targettype in ["collection", "document", "array", "object", "value"]:
        print "#def test_delete_%s(self):\n    " % targettype

