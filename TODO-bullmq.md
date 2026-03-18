# BullMQ Optimization for Create Staff API

## Status: Initial Setup

**Steps:**
1. ✅ Check deps (redis^5.10.0 ✓, install BullMQ...)
2. Enable Redis (`src/lib/redis.ts`)
3. Create queue (`src/staff/queues/staff.upload.queue.ts`)
4. Edit `src/staff/services/create-staff.service
