import base64
import hmac, sha

def create_policy(json):
    return base64.b64encode(json)

def sign_policy(policy):
    aws_secret_key = '7ytH0P+dwSBxlG5nIIiidBQyE3xvm4+OX/DlwiHq'
    return base64.b64encode(hmac.new(aws_secret_key, policy, sha).digest())

if __name__ == '__main__':
    policy_json = """{"expiration": "2012-01-01T00:00:00Z",
      "conditions": [ 
        {"bucket": "thiscourse_uploads"}, 
        ["starts-with", "$key", "uploads/"],
        {"acl": "private"},
        {"success_action_redirect": "http://localhost/"},
        ["starts-with", "$Content-Type", ""],
        ["content-length-range", 0, 1048576]
      ]
    }"""
    enc_policy =  create_policy(policy_json)
    print enc_policy
    print sign_policy(enc_policy)