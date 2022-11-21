// export const POINT_ONE = '100000000000000000000000';

// export class PostedMessage {
//   premium: boolean;
//   sender: string;
//   text: string;

//   constructor({ premium, sender, text }: PostedMessage) {
//     this.premium = premium;
//     this.sender = sender;
//     this.text = text;
//   }
// }

export enum Correctness {
	DOES_NOT_EXIST = 0,
	WRONG_POSITION = 1,
	CORRECT = 2
}

export enum GameStatus {
	IN_PROGRESS = 0,
	WON = 1,
	LOST = 2
}
