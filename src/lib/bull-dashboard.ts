import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { avatarQueue } from '@/staff/queues/staff.upload.queue';
import { sendOtpQueue } from '@/auth/queues/email.send.queue'
import '@/staff/queues/staff.upload.worker'
import '@/auth/queues/email.send.worker'

export const board = (app: any) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');

    createBullBoard({
        queues: [
            new BullMQAdapter(avatarQueue),
            new BullMQAdapter(sendOtpQueue)
        ],
        serverAdapter,
    });

    app.use('/bull-board', serverAdapter.getRouter());
};



