function test_bad_requests() {
    get('/api/grades/4e6574f0acc797e106000003', "", statuscode(201))
}

function run_api_tests() {
    test_bad_requests()
}
