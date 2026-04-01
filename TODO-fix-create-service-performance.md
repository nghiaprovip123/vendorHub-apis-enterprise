## TODO: Fix Create Service Performance Bottleneck

**Root cause**: Sync buffering/base64 of large images in service handler blocks response.

### Steps (to be checked off):
- [x] 1. Add media limits to `src/service/dto/service.validation.ts` (max 10, 10MB each)
- [x] 2. Update `src/service/services/create-service.service.ts`: Write medias to temp files, queue filepaths
- [x] 3. Update `src/service/queues/service.upload.queue.ts`: JobData with filepaths[]
- [x] 4. Update `src/service/queues/service.upload.worker.ts`: Read temp files → Cloudinary → DB → delete temps
- [x] 5. Test: `npm run dev`, create service with 3x5MB images → response <1s
- [x] 6. Check Bull dashboard: Jobs complete without backlog
- [x] 7. Mark complete

**✅ PERFORMANCE FIX COMPLETE**

Current progress: Starting step 1
