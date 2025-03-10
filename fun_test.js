import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// Custom error rate metric
let errorRate = new Rate('http_errors');

export let options = {
    stages: [
        { duration: '10s', target: 5000 },  // 5,000 users in 10 seconds (Sudden spike)
        { duration: '1m', target: 10000 },  // Hold 10,000 users for 1 min
        { duration: '2m', target: 20000 },  // Hold 20,000 users for 2 min
        { duration: '1m', target: 5000 },   // Reduce to 5,000 users
        { duration: '30s', target: 0 },     // Gradual cooldown
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // 95% of requests under 1s
        'http_req_failed': ['rate<0.05'],    // Less than 5% failures
    },
};

export default function () {
    // let url = `https://api.blinky.ma/query/categories?latitude=33.5887746&longitude=-7.4985167`;
    let url = `https://ma.afribaba.com/`;

    let res = http.get(url);

    check(res, {
        'Status is 200': (r) => r.status === 200,
        'Response time < 500ms': (r) => r.timings.duration < 1000,
    });

    errorRate.add(res.status !== 200);

    sleep(Math.random() * 2); // Simulate real user behavior
}

