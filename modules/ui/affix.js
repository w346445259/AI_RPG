const overlay = document.getElementById('affix-selection-overlay');
const choiceList = document.getElementById('affix-choice-list');
const skipBtn = document.getElementById('affix-skip-btn');

export function showAffixSelection(options = []) {
    if (!overlay || !choiceList) return;
    overlay.classList.remove('hidden');
    choiceList.innerHTML = '';

    options.forEach(option => {
        const card = document.createElement('div');
        card.className = 'affix-card';

        const title = document.createElement('h3');
        title.textContent = option.name;
        card.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = option.description;
        card.appendChild(desc);

        const btn = document.createElement('button');
        btn.textContent = '选择';
        btn.addEventListener('click', () => {
            if (typeof window.chooseAffixOption === 'function') {
                window.chooseAffixOption(option.id);
            }
        });
        card.appendChild(btn);

        choiceList.appendChild(card);
    });
}

export function hideAffixSelection() {
    if (overlay) overlay.classList.add('hidden');
    if (choiceList) choiceList.innerHTML = '';
}

if (skipBtn) {
    skipBtn.addEventListener('click', () => {
        if (typeof window.skipAffixSelection === 'function') {
            window.skipAffixSelection();
        }
    });
}
