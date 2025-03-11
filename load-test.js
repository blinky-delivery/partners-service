import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 200 },  // ramp-up to 200 VUs over 1 minute
        { duration: '2m', target: 200 },  // stay at 200 VUs for 2 minutes
        { duration: '1m', target: 500 },  // ramp-up to 500 VUs over 1 minute
        { duration: '3m', target: 500 },  // hold 500 VUs for 3 minutes
        { duration: '1m', target: 1000 }, // ramp-up to 1000 VUs over 1 minute
        { duration: '5m', target: 1000 }, // hold 1000 VUs for 5 minutes
        { duration: '2m', target: 0 },    // ramp-down to 0 VUs over 2 minutes
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

// List of endpoints to be tested
const endpoints = [
    'https://api.blinky.ma/query/sites?latitude=33.60601048939495&longitude=-7.568914167667779',
    'https://api.blinky.ma/query/site-listing/6de5ea6f-72c4-4d45-8cb6-0967bfe724f2',
    'https://api.blinky.ma/query/product/3451e93c-f804-4fb8-91cf-36e60330145d',
];

export default function () {
    // Randomly select one of the endpoints
    const url = endpoints[Math.floor(Math.random() * endpoints.length)];
    let res = http.get(url);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    // Simulate user think-time: sleep between 0.5 to 2 seconds randomly
    sleep(Math.random() * 1.5 + 0.5);
}
