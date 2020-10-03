import chai from 'chai';

import Queue from '../src';
import BaseQueue, { IMessage } from '../src/queues/BaseQueue';
import { IQueueHandlerConfig } from '../src/queues/queueConfig';

const expect = chai.expect;

const stubQueueConfig = {
	appName: 'appName',
	defaultQueueConfig: {
		exchange: 'exchange',
		deferredExchange: 'exchange-deferred',
		deadLetterExchange: 'x-dead-exchange',
		durable: false,
		ack: true
	},
	queues: {
		queueOne: {
			ack: true,
			messageBodySchema: {
				type: 'object'
			}
		},
		queueTwo: {
			ack: false,
			messageBodySchema: {
				type: 'object'
			}
		}
	}
};

const stubConnectionUrls = ['url'];

interface StubbedQueue extends BaseQueue {
	simulateMessage: (data: any) => void;
}

const createQueueStub = (
	config = stubQueueConfig,
	connectionUrls = stubConnectionUrls
) => {
	const queueHandler = new Queue(config, connectionUrls);
	Object.values(queueHandler.queues).forEach((queue: StubbedQueue) => {
		queue.simulateMessage = function (data) {
			this.emit('message', data);
		};
	});
	return queueHandler;
};

describe('Queue', () => {
	it('Should not throw on create', () => {
		type Keys = typeof stubQueueConfig.queues;
		const queueHandler = new Queue<Keys>(stubQueueConfig, stubConnectionUrls);
		queueHandler.queues.queueOne;
	});

	it('Should have queues property that contains all configured queues', () => {
		const queueHandler = new Queue(stubQueueConfig, stubConnectionUrls);
		expect(queueHandler.queues).to.have.all.keys('queueOne', 'queueTwo');
	});

	describe('.queues.someQueue message', () => {
		it('Should recieve messages using the onMessage funciton', () => {
			const queue = createQueueStub().queues.queueOne as StubbedQueue;
			let m;
			queue.on('message', message => {
				m = message;
			});
			queue.simulateMessage({ hello: true });
			expect(m)
				.to.be.an('object')
				.and.have.all.keys('hello');
		});
		it('Should have ack and nack when configured', () => {
			const queueHandler = createQueueStub();
			const queue = createQueueStub().queues.queueOne as StubbedQueue;
			let m;
			queue.listen(
				(message: IMessage) => {
					m = message;
				}
			);
			queue.messageHandler({
				properties: { contentType: 'text/plain' },
				fields: {},
				content: Buffer.from('Test')
			} as any);
			expect(typeof m.ack).to.equal('function');
			expect(typeof m.nack).to.equal('function');
		});
		it('Should throw if ack or nack is called when not configured');
		it('Should emit "message" when a message is found');
		describe('worker()', () => {
			it('Should be called when a message is recieved from queue');
			it('Should contain message');
		});
		describe('ack()', () => {
			it('Shuold call underlying ack');
		});
		describe('nack()', () => {
			it('Shuold call underlying nack');
		});
	});
});
