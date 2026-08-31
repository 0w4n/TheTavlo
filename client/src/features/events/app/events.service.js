export class EventsService {
    constructor(repository) {
        Object.defineProperty(this, "repository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: repository
        });
    }
    async getAllEvents() {
        return this.repository.findAll();
    }
}
