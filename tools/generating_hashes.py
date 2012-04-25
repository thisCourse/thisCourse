def test_hash(fn):
    out = map(fn, ids)
    print "%d collisions, out of %d keys" % (len(out) - len(set(out)), len(ids))
    
import random
def randhash(id):
    return random.randint(0,10000000)

def chunkhash(length):
    if 24 % length != 0:
        raise "Length does not divide 24"
    def chunker(id):
        result = 0
        for i in range(0,24,length):
            result ^= int(id[i:i+length], 16)
        return result
    return chunker

def maxchunk(id):
    val =  int(id[8::-1], 16) ^ \
           int(id[16:24], 16) ^ \
           int(id[8:16], 16)
    

def ent(x):
    xn = x / (sum(x) * 1.0)
    return sum(xn * log(xn + 0.00000000001))