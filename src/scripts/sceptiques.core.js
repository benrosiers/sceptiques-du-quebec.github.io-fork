import './libraries/helpers';
import CSSDoc from './libraries/cssdoc';
import ModalScore from './libraries/modalscore';
import ModalChangelog from './libraries/modalchangelog';
import FingerprintJS from '@fingerprintjs/fingerprintjs';


const GAME_URL = 'https://sceptiquesduquebec.com/brick-breaqueer/scripts/brickbreaqueer.core.min.js';
const API_URL  = 'https://script.google.com/macros/s/AKfycbwH5V6n3wWoteG9czsAczmHKWykcDuGX8pqjtM_2uf6n1ykDKI2Os3QrB-A2kgnTNqz/exec';


const LEADERBOARDS = [
	{
		id: 'grouped',
		label: 'Meilleur score',
		rowsKey: 'topGrouped',
		columns: ['#', 'utilisateur', 'niveau', 'score'],
		cellFn: (row, i) => [i + 1, row[2], row[3], row[4].toLocaleString()]
	},
	{
		id: 'scores',
		label: 'Top scores',
		rowsKey: 'topScores',
		columns: ['#', 'utilisateur', 'niveau', 'score'],
		cellFn: (row, i) => [i + 1, row[2], row[3], row[4].toLocaleString()]
	},
	{
		id: 'actifs',
		label: 'Plus actifs',
		rowsKey: 'topActive',
		columns: ['#', 'utilisateur', '', 'parties'],
		cellFn: (row, i) => [i + 1, row.username, '', row.parties]
	}
];


({

	modalscore: null,
	changelog:  null,
	fingerprint: null,
	activeLeaderboard: 0,
	leaderboardData: null,


	init: async function() {
		await this.cleanUrl();
		await this.shuffleBackground();
		await documentReady();
		this.modalscore = new ModalScore();
		this.changelog  = new ModalChangelog();
		this.loadFingerprint();
		this.loadGame();
		this.loadLeaderboard();
		this.initChangelog();
	},


	cleanUrl: async function() {
		if (window.location.search.includes('fbclid')) {
			const url = new URL(window.location);
			url.searchParams.delete('fbclid');
			window.history.replaceState({}, document.title, url.pathname + url.search);
		}
	},


	shuffleBackground: async function() {
		const driftTime = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--drift-time').replace(/s$/gi, ''));
		const delay = 0 - (Math.floor(Math.random() * (driftTime + 1)));
		document.documentElement.style.setProperty('--drift-time-delay', `${delay}s`);
	},


	loadGame: async function() {
		const cssdoc = new CSSDoc;
		await loadScript(`${GAME_URL}?${Math.floor(Date.now() / 1000)}`);
		await BrickBreaqueer({
			parent: "game-container",
			fontFamily: cssdoc('--font-title'),
			fontWeight: 500,
			color: cssdoc('--color-fg'),
			onLoadComplete: async () => document.querySelector('#game-container').classList.add('loaded'),
			onGameOver: async stats => await this.logScore(stats)
		});
	},


	loadFingerprint: async function() {
		const fp = await FingerprintJS.load();
		this.fingerprint = (await fp.get()).visitorId;
	},


	loadLeaderboard: async function(data) {
		data = data || await this.getLeaderboard();
		this.leaderboardData = data || null;
		this.renderLeaderboardTabs();
		this.renderLeaderboardTable();
	},


	renderLeaderboardTabs: function() {
		const tabsEl = document.querySelector('.leaderboard-tabs');
		tabsEl.replaceChildren();
		LEADERBOARDS.forEach((board, i) => {
			const isActive = i === this.activeLeaderboard;
			const btn = create('button', 'leaderboard-tab' + (isActive ? ' active' : ''), board.label, {
				type: 'button',
				role: 'tab',
				id: `tab-${board.id}`,
				'aria-selected': isActive ? 'true' : 'false',
				'aria-controls': 'leaderboard-panel',
				tabindex: isActive ? '0' : '-1'
			});
			btn.addEventListener('click', () => {
				this.activeLeaderboard = i;
				this.renderLeaderboardTabs();
				this.renderLeaderboardTable();
			});
			btn.addEventListener('keydown', (evt) => {
				let next = null;
				if (evt.key === 'ArrowRight') next = (i + 1) % LEADERBOARDS.length;
				else if (evt.key === 'ArrowLeft') next = (i - 1 + LEADERBOARDS.length) % LEADERBOARDS.length;
				if (next !== null) {
					evt.preventDefault();
					this.activeLeaderboard = next;
					this.renderLeaderboardTabs();
					this.renderLeaderboardTable();
					document.querySelector(`#tab-${LEADERBOARDS[next].id}`)?.focus();
				}
			});
			tabsEl.appendChild(btn);
		});
	},


	renderLeaderboardTable: function() {
		const panelEl = document.querySelector('.leaderboard-panel');
		const board = LEADERBOARDS[this.activeLeaderboard];

		panelEl.setAttribute('aria-labelledby', `tab-${board.id}`);

		if (!this.leaderboardData) {
			panelEl.classList.add('loaded');
			panelEl.replaceChildren(create('p', 'leaderboard-empty', 'Impossible de charger le classement.'));
			return;
		}

		const rows = this.leaderboardData[board.rowsKey];

		if (!rows || rows.length === 0) {
			panelEl.classList.add('loaded');
			const msg = create('p', 'leaderboard-empty', 'Aucun résultat pour ce classement.');
			panelEl.replaceChildren(msg);
			return;
		}

		const table = create('table');
		const colgroup = create('colgroup');
		['rank', 'user', 'metric', 'value'].forEach(cls => colgroup.create('col', cls));
		table.appendChild(colgroup);
		const header = table.create('tr');
		board.columns.forEach(col => header.create('td', null, col));

		rows.forEach((row, i) => {
			const cells = board.cellFn(row, i);
			const tr = table.create('tr');
			cells.forEach(cell => tr.create('td', null, cell));
		});

		panelEl.classList.add('loaded');
		panelEl.replaceChildren(table);
	},


	getCredentials: async function() {
		return new Promise(res => {
			const username  = localStorage.getItem('username');
			this.modalscore.show(username || '', results => {
				if(results.savescore) localStorage.setItem('username', results.username);
				res(results);
			});
		});
	},


	logScore: async function(stats) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		const creds = await this.getCredentials();
		if(creds.savescore) {
			this.saveScore({
				fingerprint: this.fingerprint,
				username: creds.username,
				level: stats.levelReached,
				score: stats.score,
				hash: md5(`${this.fingerprint}:${creds.username}:${stats.levelReached}:${stats.score}`)
			});
		}
	},


	saveScore: async function (entry) {
		try {
			const results = await fetch(API_URL, { method: 'POST', body: JSON.stringify(entry) });
			const data = await results.json();
			if(data.status == 'success') {
				this.loadLeaderboard(data.leaderboard);
			} else {
				console.error(data.message);
				return false;
			}
		} catch (e) {
			console.error(e);
			return false;
		}
	},


	getLeaderboard: async function() {
		try {
			const results = await fetch(API_URL);
			const data = await results.json();
			return data;
		} catch (e) {
			console.error(e);
			return false;
		}
	},


	initChangelog: function() {
		const link = document.querySelector('#show-changelog');
		if (!link) return;
		link.addEventListener('click', async evt => {
			evt.preventDefault();
			await working(this.changelog.showChangelog());
		});
	}


}).init();