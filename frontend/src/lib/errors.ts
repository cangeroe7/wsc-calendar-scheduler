// errors.ts
export class NotFoundError extends Error {
	constructor(message = "Not Found") {
		super(message);
		this.name = "NotFoundError";
	}
}

export class ServerError extends Error {
	constructor(message = "Server Error") {
		super(message);
		this.name = "ServerError";
	}
}
