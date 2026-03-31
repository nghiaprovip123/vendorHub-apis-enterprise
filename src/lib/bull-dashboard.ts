import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { avatarQueue } from '@/staff/queues/staff.upload.queue';
import { sendOtpQueue } from '@/auth/queues/email.send.queue'
import { serviceImageQueue } from '@/service/queues/service.upload.queue';
import { sendBookingEmailQueue } from '@/booking/queues/email-create-booking.queue'
import '@/staff/queues/staff.upload.worker'
import '@/auth/queues/email.send.worker'
import '@/service/queues/service.upload.worker'
import '@/booking/queues/email-create-booking.worker'

export const board = (app: any) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');

    createBullBoard({
        queues: [
            new BullMQAdapter(avatarQueue),
            new BullMQAdapter(sendOtpQueue),
            new BullMQAdapter(serviceImageQueue),
            new BullMQAdapter(sendBookingEmailQueue)
        ],
        serverAdapter,
    });

    app.use('/bull-board', serverAdapter.getRouter());
};



