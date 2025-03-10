import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 50 }, // Ramp up to 50 users in 10s
        { duration: '30s', target: 50 }, // Stay at 50 users for 30s
        { duration: '10s', target: 0 },  // Ramp down to 0 users in 10s
    ],
};

export default function () {
    let res = http.get('https://api.blinky.ma/query/categories?latitude=33.5887746&longitude=-7.4985167');

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1); // Simulate user wait time
}
