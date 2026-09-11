# Testing Guide — VitaNova Health

## Automated Test Suite
Run the test runner:
```bash
npm test
# or
node test/validate-system.js
```

## Manual Verification
1. Run local preview: `npx -y serve . -l 3005`.
2. Open `http://localhost:3005/book-appointment.html`.
3. Submit a specialist doctor consultation request.
4. Observe console logs with payload and generated `SN-VIT-` ID.
5. Verify that the clinical confirmation receipt modal renders smoothly.
