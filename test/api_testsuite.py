from api_test import Request, get, post, put, delete
import unittest

dummy_id = "123456781234567812345678"
collection_path = "/test/"

class TestAPI(unittest.TestCase):

    def setUp(self):
        self.objs = {}
        self.objs["complex"] = {"_id": "123456789012345678901234", "sections": [{"_id": "123456789012345678901235", "val": 556}, {"_id": "123456789012345678901236", "val": 443}], "d": {"more": "stuff", "here": "!"}, "type": 54}
        self.objs["simple"] = {"nums": [1,2,3], "name": "Jamie"}
        self.objs["embedded"] = {"a1": {"a1b1": {"a1b1c1": 96, "a1b1c2": "hi"}, "a1b2": {"a1b2c1": "boo", "a1b2c2": 37}}, "a2": {"a2b1": {"a2b1c1": 276, "a2b1c2": 46}, "a2b2": {"a2b2c1": "rawr", "a2b2c2": "houy"}}}
        # create the objects
        for key in self.objs:
            obj = self.objs[key] = {"data": self.objs[key]}
            obj["response"] = post(collection_path, obj["data"])
            obj["id"] = obj["response"].body['_id']
            obj["path"] = collection_path + obj["id"]
    
    def tearDown(self):
        for obj in self.objs:
            try:
                delete(obj["path"])
            except:
                pass

    def test_get_nonexistent_returns_404(self):
        get("/testingbadcollectionname").status(404)
        get(collection_path + "001001001001001001001001/").status(404)

    def test_post_nonexistent_returns_404(self):
        post("/testingbadcollectionname", data={}).status(404)
        post(collection_path + "001001001001001001001001/", data={}).status(404)
       
    def test_post_object_onto_collection(self):
        # we've already created objects in setUp, so just make sure they're accurate
        for obj in self.objs.values():
            get(obj["path"]).status(200).equals(obj["data"]).id_changed()
        
    #def test_post_array_onto_collection(self):
        
    #def test_post_value_onto_collection(self):
        
    def test_post_object_onto_document(self):
        for obj in self.objs.values():
            post(obj["path"], {"new": 33}).status(200)
            get(obj["path"]).equals({"new": 33}).attrval("_id", obj["id"])
        
    #def test_post_array_onto_document(self):
        
    #def test_post_value_onto_document(self):
        
    def test_post_object_onto_array(self):
        obj = self.objs["complex"]
        old_array = get(obj["path"] + "/sections").body
        # test with no specified _id
        _id = post(obj["path"] + "/sections", {"newstuff": 55}).status(200).hasfield("_id").body["_id"]
        get(obj["path"] + "/sections/" + _id).status(200).hasfield("_id").equals({"newstuff": 55})
        # test with _id specified
        _id = post(obj["path"] + "/sections", {"newobj": 34, "_id": dummy_id}).status(200).hasfield("_id").body["_id"]
        get(obj["path"] + "/sections/" + _id).status(200).id_changed().equals({"newobj": 34})
        # check that only 2 objects have been added
        new_array = get(obj["path"] + "/sections").body
        assert len(new_array)==len(old_array)+2, "After adding 2 objects, the length of the array went from %d to %d!" % (len(old_array), len(new_array))
        
    def test_post_array_onto_array(self):
        obj = self.objs["complex"]
        post(obj["path"] + "/sections", ["a", "b"]).status(200)
        get(obj["path"] + "/sections").status(200).equals(["a", "b"])
        
    def test_post_value_onto_array(self):
        obj = self.objs["complex"]
        old_array = get(obj["path"] + "/sections").body
        post(obj["path"] + "/sections", 17).status(200)
        post(obj["path"] + "/sections", "hello").status(200)
        get(obj["path"] + "/sections").contains(17).contains("hello")
        # check that only 2 items have been added
        new_array = get(obj["path"] + "/sections").body
        assert len(new_array)==len(old_array)+2, "After adding 2 values, the length of the array went from %d to %d!" % (len(old_array), len(new_array))
        
    def test_post_object_onto_object(self):
        obj = self.objs["embedded"]
        new_object = {"a2b1": {"a2b1c2": 17, "newkey": "hoi!"}}
        post(obj["path"] + "/a2", new_object).status(200)
        # ensure that the object was saved
        get(obj["path"] + "/a2").status(200).equals(new_object)
        # ensure that other parts of the document were not affected
        get(obj["path"] + "/a1").status(200).equals(obj["data"]["a1"])
        # post onto an object with _id, inside an array
        obj = self.objs["complex"]
        old_object = obj["response"].body["sections"][0]
        new_object = {"g": 92, "_id": dummy_id}
        post(obj["path"] + "/sections/" + old_object["_id"], new_object).status(200)
        get(obj["path"] + "/sections/" + old_object["_id"]).status(200).equals(new_object).attrval("_id", old_object["_id"])
        
        
    #def test_post_array_onto_object(self):
        
    #def test_post_value_onto_object(self):
        
    def test_post_object_onto_value(self):
        obj = self.objs["simple"]
        post(obj["path"] + "/name", {"first": "Jamie", "last": "Alexandre"}).status(200)
        get(obj["path"] + "/name").status(200).equals({"first": "Jamie", "last": "Alexandre"}).attrval("_id", None)
        
    def test_post_array_onto_value(self):
        obj = self.objs["simple"]
        post(obj["path"] + "/name", ["Jamie", "Alexandre"]).status(200)
        get(obj["path"] + "/name").status(200).equals(["Jamie", "Alexandre"])
        
    def test_post_value_onto_value(self):
        obj = self.objs["simple"]
        # number
        post(obj["path"] + "/name", 234).status(200)
        get(obj["path"] + "/name").status(200).equals(234)
        # string
        post(obj["path"] + "/name", "Jamie Alexandre").status(200)
        get(obj["path"] + "/name").status(200).equals("Jamie Alexandre")
        
    def test_put_object_onto_collection(self):
        put(collection_path, {"hello": "world"}).status(405)
        put(collection_path, {"hello": "world", "_id": self.objs["simple"]['id']}).status(405)
        
    def test_put_array_onto_collection(self):
        put(collection_path, [1,2,3]).status(405)
        put(collection_path, [{"hello": "world"}, {"_id": self.objs["simple"]['id']}]).status(405)
        
    def test_put_value_onto_collection(self):
        put(collection_path, "hello world").status(405)
        put(collection_path, 17).status(405)        
        
    def test_put_object_onto_document(self):
        obj = self.objs["complex"]
        put(obj["path"], {"d": {"here": "?" }, "_id": dummy_id}).status(200)
        # check that the id didn't change
        get(obj["path"]).status(200).attrval("_id", obj["response"].body["_id"])
        # ensure that the value itself was set
        get(obj["path"] + "/d/here").status(200).equals("?")
        # ensure that it was a merge, not an overwrite
        get(obj["path"] + "/type").status(200).equals(obj["data"]["type"])
        # ensure that the merge was recursive
        get(obj["path"] + "/d/more").status(200).equals(obj["data"]["d"]["more"])
        
    #def test_put_array_onto_document(self):
        
    #def test_put_value_onto_document(self):
        
    #def test_put_object_onto_array(self):
        
    #def test_put_array_onto_array(self):
        
    #def test_put_value_onto_array(self):
        
    def test_put_object_onto_object(self):
        obj = self.objs["embedded"]
        put(obj["path"] + "/a2", {"a2b1": {"a2b1c2": 17, "newkey": "hoi!"}}).status(200)
        # ensure that the value itself was updated
        get(obj["path"] + "/a2/a2b1/a2b1c2").status(200).equals(17)
        # ensure that the new field was added
        get(obj["path"] + "/a2/a2b1/newkey").status(200).equals("hoi!")
        # ensure that it was a merge, not an overwrite
        get(obj["path"] + "/a2/a2b2").status(200).equals(obj["data"]["a2"]["a2b2"])
        # ensure that the merge was recursive
        get(obj["path"] + "/a2/a2b1/a2b1c1").status(200).equals(obj["data"]["a2"]["a2b1"]["a2b1c1"])
        
        
    #def test_put_array_onto_object(self):
        
    #def test_put_value_onto_object(self):
        
    #def test_put_object_onto_value(self):
        
    #def test_put_array_onto_value(self):
        
    #def test_put_value_onto_value(self):
        
    def test_delete_collection(self):
        delete("/test").status(405)
        
    def test_delete_document(self):
        obj = self.objs["embedded"]
        get(obj["path"]).status(200)
        delete(obj["path"]).status(200)
        get(obj["path"]).status(404)
        
    def test_delete_array(self):
        obj = self.objs["complex"]
        get(obj["path"] + "/sections").status(200)
        delete(obj["path"] + "/sections").status(200)
        get(obj["path"] + "/sections").status(404)
        
    def test_delete_object(self):
        # delete an object at a key
        obj = self.objs["embedded"]
        get(obj["path"] + "/a1").status(200)
        delete(obj["path"] + "/a1").status(200)
        get(obj["path"] + "/a1").status(404)
        get(obj["path"] + "/a2").status(200)
        # delete an object in an array
        obj = self.objs["complex"]
        _id = obj["response"].body["sections"][0]["_id"]
        _id2 = obj["response"].body["sections"][1]["_id"]
        get(obj["path"] + "/sections/" + _id).status(200)
        delete(obj["path"] + "/sections/" + _id).status(200)
        get(obj["path"] + "/sections/" + _id).status(404)
        get(obj["path"] + "/sections/" + _id2).status(200)
        
        
    def test_delete_value(self):
        obj = self.objs["simple"]
        get(obj["path"] + "/name").status(200)
        delete(obj["path"] + "/name").status(200)
        get(obj["path"] + "/name").status(404)
        get(obj["path"] + "/nums").status(200)

        
if __name__ == '__main__':
    unittest.main()
    
