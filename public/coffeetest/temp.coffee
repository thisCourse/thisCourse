class Test

	test: ->
		@constructor.name

class Test2 extends Test

class Test3 extends Test2

t = new Test3
alert t.test()