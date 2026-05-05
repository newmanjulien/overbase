declare global {
	namespace App {
		interface PageData {
			headerTitle?: string;
			headerTitleEditable?: boolean;
		}

		interface PageState {
			initialMessage?: string;
		}
	}
}

export {};
