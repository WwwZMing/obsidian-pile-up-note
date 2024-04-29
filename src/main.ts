import { App, ItemView, Modal, Plugin, TFile, WorkspaceLeaf, PluginManifest, Vault } from 'obsidian';

const VIEW_Note_List = "My-view";

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	async load() {
		await this.loadSettings();
		this.registerEvent(this.app.workspace.on('file-open', () => {
			new MyModal(this.app).open()
		}));
		this.registerView(
			VIEW_Note_List,
			(leaf) => new MyView(leaf)
		);
		
		const ribbonIconEl = this.addRibbonIcon('dice', 'History', (_evt: MouseEvent) => {
			this.activateView();
		});

		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.addCommand({
			id: 'show-history',
			name: 'Show your file status history',
			callback: () => {
				new MyModal(this.app).open();
			}
		});
	}


	
	onunload() {

	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_Note_List);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			const leaf = await workspace.getRightLeaf(false);
			if (leaf)
				leaf.setViewState({ type: VIEW_Note_List, active: true });
		}
		if (leaf)
			workspace.revealLeaf(leaf);
	}
}



class MyModal extends Modal {
	constructor(app: App){
		super(app);
	}

	onOpen() {
		Render(this.contentEl);
	}
	async onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class MyView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_Note_List;
	}

	getDisplayText() {
		return "My View";
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();
		Render(container);
	}

	async onClose() {
	}
}

export function Render(contentEl: HTMLElement): void {
	let fileList: TFile[] = this.app.vault.getMarkdownFiles();
	const left = contentEl.createEl("div");
	left.createEl("div", { text: "最近7天创建的笔记：" ,cls:"Create"});
	const right = contentEl.createEl("div");
	right.createEl("div", { text: "最近7天更新的笔记：" ,cls:"Modify"});
	fileList.forEach((file)=> {
		const standard = Date.now();
		if (standard - file.stat.ctime <= 604800000)
			left.createEl("div", { text: file.name })
				.onClickEvent(async ()=> {await this.app.workspace.getLeaf().openFile(file);});
		if (standard - file.stat.mtime >= 604800000)
			right.createEl("div", { text: file.name })
				.onClickEvent(async ()=> {await this.app.workspace.getLeaf().openFile(file);});
	});
}