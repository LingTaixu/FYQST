'use strict';

const terms = ['公众号', '公众微信', '微信公众', '公众帐号', '微信号', '关注微信', 'echeverra', '绯雨骑士团GM'];
const pattern = new RegExp(terms.join('|'), 'i');
const replacements = [
    ['关注公众号宝箱', '福利宝箱'],
    ['关注公众号礼包', '福利礼包'],
    ['关注公众微信号奖励', '福利奖励'],
    ['恭喜您，关注公众微信号成功，以下您的奖励，请注意查收！', '恭喜您，福利领取成功，奖励请查收！']
];

function cleanText(value) {
    let result = value;
    for (const [from, to] of replacements) result = result.split(from).join(to);
    // Remove complete promotion paragraphs, including their account names and links.
    return result.split(/\r?\n|<br\s*\/?>/i)
        .filter(line => !pattern.test(line))
        .join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function cleanValue(value) {
    if (typeof value !== 'string' || !pattern.test(value)) return value;
    try {
        const data = JSON.parse(value);
        function walk(node) {
            if (typeof node === 'string') return cleanText(node);
            if (Array.isArray(node)) return node.map(walk);
            if (node && typeof node === 'object') {
                return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, walk(child)]));
            }
            return node;
        }
        return JSON.stringify(walk(data));
    } catch {
        return cleanText(value);
    }
}

module.exports = { terms, pattern, replacements, cleanText, cleanValue };
