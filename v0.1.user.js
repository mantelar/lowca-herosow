// ==UserScript==
// @name         Łowca Herosów
// @namespace    http://tampermonkey.net/
// @version      v0.1
// @description  Śledzi obecność gracza w obszarach respienia i wyświetla tabelę z informacjami, z przyciskami do przełączania herosa
// @author       Mantelar
// @match        http://*.margonem.pl/*
// @match        https://*.margonem.pl/*
// @match        http://*.margonem.com/*
// @match        https://*.margonem.com/*
// @exclude      https://commons.margonem.pl/*
// @exclude      https://margonem.pl/*
// @exclude      https://www.margonem.pl/*
// @exclude      https://margonem.com/*
// @exclude      https://www.margonem.com/*
// @exclude      https://forum.margonem.pl/*
// @exclude      https://www.forum.margonem.pl/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const RESPAWN_RADIUS = 11;
    let currentSort = GM_getValue('sort', { column: 'time', asc: true });
    let lastCoords = null;
    let activeHeroAbbr = GM_getValue('lastHeroAbbr', 'Koz');
    let lastStaticCheck = 0;

    const RESPAWN_LIST = [
        { map: "Stare Ruiny", abbr: "StRuiny", x: 56, y: 53, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Stare Ruiny", abbr: "StRuiny", x: 57, y: 48, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Stare Ruiny", abbr: "StRuiny", x: 58, y: 25, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Stare Ruiny", abbr: "StRuiny", x: 66, y: 22, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Stare Ruiny", abbr: "StRuiny", x: 72, y: 17, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - wejście płd.", abbr: "PZ w płd", x: 9, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - wejście płd.", abbr: "PZ w płd", x: 16, y: 7, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - wejście płn.", abbr: "PZ w płn", x: 6, y: 9, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - wejście płn.", abbr: "PZ w płn", x: 18, y: 7, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - wejście wsch.", abbr: "PZ w ws", x: 8, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - wejście wsch.", abbr: "PZ w ws", x: 12, y: 7, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - podziemia płd.", abbr: "PZ p płd", x: 8, y: 27, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - podziemia płd.", abbr: "PZ p płd", x: 11, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - podziemia płd.", abbr: "PZ p płd", x: 19, y: 27, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - podziemia płd.", abbr: "PZ p płd", x: 21, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - kanały", abbr: "PZ kan", x: 8, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - kanały", abbr: "PZ kan", x: 20, y: 28, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - sala zgro.", abbr: "PZ s zgr", x: 4, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - sala zgro.", abbr: "PZ s zgr", x: 10, y: 10, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - sala zgro.", abbr: "PZ s zgr", x: 30, y: 9, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek - sala zgro.", abbr: "PZ s zgr", x: 42, y: 29, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek p.1", abbr: "PZ p1", x: 8, y: 13, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek p.1", abbr: "PZ p1", x: 13, y: 4, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek p.2", abbr: "PZ p2", x: 2, y: 11, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęty Zamek p.2", abbr: "PZ p2", x: 21, y: 6, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 44, y: 9, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 46, y: 24, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 52, y: 10, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 54, y: 12, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 56, y: 22, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica", abbr: "PS", x: 4, y: 10, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica", abbr: "PS", x: 6, y: 13, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica", abbr: "PS", x: 8, y: 9, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica", abbr: "PS", x: 13, y: 12, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica", abbr: "PS", x: 17, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.1", abbr: "PS p1", x: 3, y: 10, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.1", abbr: "PS p1", x: 4, y: 17, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.1", abbr: "PS p1", x: 5, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.1", abbr: "PS p1", x: 12, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.1", abbr: "PS p1", x: 15, y: 16, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.1", abbr: "PS p1", x: 17, y: 14, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.2", abbr: "PS p2", x: 5, y: 14, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.2", abbr: "PS p2", x: 8, y: 4, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.2", abbr: "PS p2", x: 9, y: 14, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.2", abbr: "PS p2", x: 13, y: 12, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica p.2", abbr: "PS p2", x: 15, y: 6, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 5, y: 36, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 7, y: 35, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 9, y: 9, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 15, y: 27, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 22, y: 33, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 24, y: 6, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 26, y: 34, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 27, y: 20, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 30, y: 8, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 31, y: 21, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.1", abbr: "PSp p1s1", x: 31, y: 35, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 5, y: 9, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 5, y: 35, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 12, y: 17, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 17, y: 4, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 17, y: 34, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 21, y: 22, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 22, y: 4, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.1 s.2", abbr: "PSp p1s2", x: 27, y: 24, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.2 s.2", abbr: "PSp p2s2", x: 2, y: 5, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.2 s.2", abbr: "PSp p2s2", x: 7, y: 11, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.2 s.2", abbr: "PSp p2s2", x: 8, y: 5, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.2 s.2", abbr: "PSp p2s2", x: 12, y: 6, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Przeklęta Strażnica - podziemia p.2 s.2", abbr: "PSp p2s2", x: 12, y: 18, hero_name: "Domina Ecclesiae", hero_abbr: "Dom", hero_level: 21 },
        { map: "Ithan", abbr: "Ithan", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Izba wytrzeźwień", abbr: "IzbaWyt", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Zajazd u Makiny", abbr: "ZUMak", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Zajazd u Makiny p.1", abbr: "ZUMak p1", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Zajazd u Makiny p.2", abbr: "ZUMak p2 ", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Pod Rozbrykanym Niziołkiem - piwnica", abbr: "PRNi piw", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Torneg", abbr: "Torneg", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Zajazd Umbara", abbr: "ZUmb", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Zajazd Umbara p.1", abbr: "ZUmb p1", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Łany Zboża", abbr: "ŁanyZboż", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Oberża pod Złotym Kłosem - piwnica", abbr: "OPZK piw", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Werbin", abbr: "Werbin", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Karczma pod Fioletowym Kryształem", abbr: "KarPFiKr", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Eder", abbr: "Eder", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Karczma pod Posępnym Czerepem", abbr: "KPPC", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Karczma pod Posępnym Czerepem p.1", abbr: "KPPC p1", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Dom Schadzek", abbr: "DomSchad", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Fort Eder", abbr: "FortEder", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Mokradła", abbr: "Mokradła", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Karka-han", abbr: "Ka-ha", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Karczma pod Złotą Wywerną", abbr: "KPZłotWy", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Knajpa pod Czarnym Tulipanem", abbr: "KPCzTuli", x: -1, y: -1, hero_name: "Mietek Żul", hero_abbr: "Miet", hero_level: 25 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 7, y: 87, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 28, y: 92, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 33, y: 89, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Orla Grań", abbr: "OrlaGrań", x: 10, y: 84, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 6, y: 84, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 11, y: 62, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 14, y: 22, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 14, y: 51, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 27, y: 14, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 36, y: 81, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 40, y: 29, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 42, y: 11, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 44, y: 75, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 45, y: 40, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 46, y: 49, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 46, y: 83, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 51, y: 62, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 53, y: 38, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Przełęcz Łotrzyków", abbr: "PrzŁotr", x: 55, y: 78, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 8, y: 25, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 8, y: 55, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 10, y: 65, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 15, y: 17, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 26, y: 73, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 29, y: 47, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 37, y: 6, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 45, y: 30, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 56, y: 4, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pagórki Łupieżców", abbr: "PagŁup", x: 58, y: 86, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Skład Grabieżców", abbr: "SkłGrab", x: 7, y: 17, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Skład Grabieżców", abbr: "SkłGrab", x: 9, y: 5, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Skład Grabieżców", abbr: "SkłGrab", x: 24, y: 13, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Skład Grabieżców", abbr: "SkłGrab", x: 27, y: 17, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 8, y: 44, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 12, y: 57, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 14, y: 70, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 15, y: 82, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 17, y: 49, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 20, y: 36, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 21, y: 29, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 22, y: 5, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 23, y: 91, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 28, y: 23, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 29, y: 40, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 33, y: 68, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 37, y: 24, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 39, y: 19, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 41, y: 11, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 41, y: 57, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 41, y: 76, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 45, y: 66, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 47, y: 19, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 54, y: 42, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 56, y: 51, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Dolina Rozbójników", abbr: "DolRozb", x: 57, y: 41, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Kamienna Kryjówka", abbr: "KamKryj", x: 4, y: 15, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Kamienna Kryjówka", abbr: "KamKryj", x: 13, y: 9, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Kamienna Kryjówka", abbr: "KamKryj", x: 16, y: 6, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Kamienna Kryjówka", abbr: "KamKryj", x: 28, y: 12, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Ghuli Mogilnik", abbr: "GhuMog", x: 6, y: 54, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Ghuli Mogilnik", abbr: "GhuMog", x: 7, y: 39, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Ghuli Mogilnik", abbr: "GhuMog", x: 16, y: 11, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Ghuli Mogilnik", abbr: "GhuMog", x: 32, y: 35, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Polana Ścierwojadów", abbr: "PolŚci", x: 10, y: 30, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Polana Ścierwojadów", abbr: "PolŚci", x: 22, y: 14, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Polana Ścierwojadów", abbr: "PolŚci", x: 23, y: 34, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Polana Ścierwojadów", abbr: "PolŚci", x: 43, y: 7, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 4, y: 46, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 8, y: 43, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 8, y: 53, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 9, y: 50, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 19, y: 11, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 34, y: 44, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 40, y: 4, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 44, y: 46, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 47, y: 54, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 54, y: 8, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Mokradła", abbr: "Mokradła", x: 54, y: 58, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 4, y: 87, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 6, y: 80, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 7, y: 37, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 8, y: 18, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 17, y: 35, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 20, y: 9, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 22, y: 81, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 32, y: 87, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 33, y: 78, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 36, y: 45, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 37, y: 27, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 46, y: 38, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 51, y: 46, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 52, y: 21, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Las Goblinów", abbr: "LasGob", x: 55, y: 10, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 4, y: 51, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 8, y: 62, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 9, y: 6, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 16, y: 35, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 32, y: 23, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 46, y: 19, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 52, y: 40, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Morwowe Przejście", abbr: "MorPrz", x: 55, y: 8, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Podmokła Dolina", abbr: "PodDol", x: 4, y: 37, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Podmokła Dolina", abbr: "PodDol", x: 15, y: 33, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Podmokła Dolina", abbr: "PodDol", x: 42, y: 4, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Podmokła Dolina", abbr: "PodDol", x: 54, y: 56, hero_name: "Mroczny Patryk", hero_abbr: "Pat", hero_level: 35 },
        { map: "Pieczara Niepogody p.1", abbr: "PN p1", x: 9, y: 26, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.1", abbr: "PN p1", x: 16, y: 23, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.2 - sala 1", abbr: "PN p2s1", x: 20, y: 6, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.2 - sala 1", abbr: "PN p2s1", x: 41, y: 15, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.2 - sala 2", abbr: "PN p2s2", x: 21, y: 37, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.2 - sala 2", abbr: "PN p2s2", x: 22, y: 13, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.3", abbr: "PN p3", x: 26, y: 12, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.3", abbr: "PN p3", x: 28, y: 36, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.3", abbr: "PN p3", x: 51, y: 38, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.4", abbr: "PN p4", x: 4, y: 21, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.4", abbr: "PN p4", x: 34, y: 10, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.5", abbr: "PN p5", x: 12, y: 20, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.5", abbr: "PN p5", x: 32, y: 22, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Pieczara Niepogody p.5", abbr: "PN p5", x: 40, y: 11, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Warczące Osuwiska", abbr: "WarczOsu", x: 15, y: 19, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Warczące Osuwiska", abbr: "WarczOsu", x: 16, y: 50, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Warczące Osuwiska", abbr: "WarczOsu", x: 60, y: 48, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Nora p.2", abbr: "WilN p2", x: 18, y: 5, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Legowisko Wilczej Hordy", abbr: "LegWilHo", x: 32, y: 25, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Legowisko Wilczej Hordy", abbr: "LegWilHo", x: 38, y: 2, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Legowisko Wilczej Hordy", abbr: "LegWilHo", x: 45, y: 56, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Legowisko Wilczej Hordy", abbr: "LegWilHo", x: 58, y: 34, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Krasowa Pieczara p.2", abbr: "KrPi p2", x: 6, y: 25, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Krasowa Pieczara p.2", abbr: "KrPi p2", x: 32, y: 35, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Krasowa Pieczara p.3", abbr: "KrPi p3", x: 13, y: 9, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Skarpa", abbr: "WilczSka", x: 4, y: 40, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Skarpa", abbr: "WilczSka", x: 33, y: 39, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Skarpa", abbr: "WilczSka", x: 35, y: 8, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Skarpa", abbr: "WilczSka", x: 48, y: 34, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Skarpa", abbr: "WilczSka", x: 60, y: 31, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Wilcza Skarpa", abbr: "WilczSka", x: 60, y: 68, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skarpiska Tolloków", abbr: "SkarToll", x: 4, y: 61, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skarpiska Tolloków", abbr: "SkarToll", x: 36, y: 32, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skarpiska Tolloków", abbr: "SkarToll", x: 37, y: 15, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skarpiska Tolloków", abbr: "SkarToll", x: 52, y: 25, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skalne Turnie", abbr: "SkalTurn", x: 30, y: 36, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skalne Turnie", abbr: "SkalTurn", x: 31, y: 3, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skalne Turnie", abbr: "SkalTurn", x: 42, y: 57, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Skalne Turnie", abbr: "SkalTurn", x: 61, y: 39, hero_name: "Karmazynowy Mściciel", hero_abbr: "Karm", hero_level: 45 },
        { map: "Dom Erniego", abbr: "DErn", x: 6, y: 7, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Erniego p.1", abbr: "DErn p1", x: 6, y: 5, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Artenii i Tafina", abbr: "DAiT", x: 5, y: 5, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Artenii i Tafina - piwnica", abbr: "DAiT piw", x: 11, y: 12, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Etrefana - pracownia", abbr: "DE prac", x: 6, y: 12, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Etrefana p.2", abbr: "DE p2", x: 5, y: 6, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Mrocznego Zgrzyta", abbr: "DMZ", x: 10, y: 5, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Mikliniosa p.1", abbr: "DMik p1", x: 9, y: 5, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Dom Mikliniosa - przyziemie", abbr: "DMik prz", x: 8, y: 10, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Pracownia Bonifacego p.1", abbr: "PB p1", x: 5, y: 6, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Siedziba Kultystów", abbr: "SiedKult", x: 11, y: 11, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Fort Eder", abbr: "FortEder", x: 59, y: 60, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Fortyfikacja", abbr: "Forty", x: 7, y: 17, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Fortyfikacja p.2", abbr: "Forty p2", x: 10, y: 4, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Fortyfikacja p.4", abbr: "Forty p4", x: 11, y: 14, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Fortyfikacja p.5", abbr: "Forty p5", x: 10, y: 10, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Ciemnica Szubrawców p.1 - sala 1", abbr: "CS p1s1", x: 8, y: 14, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Ciemnica Szubrawców p.1 - sala 2", abbr: "CS p1s2", x: 13, y: 5, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Ciemnica Szubrawców p.1 - sala 3", abbr: "CS p1s3", x: 45, y: 12, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Ciemnica Szubrawców p.1 - sala 3", abbr: "CS p1s3", x: 51, y: 53, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stary Kupiecki Trakt", abbr: "StKupTra", x: 8, y: 8, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stary Kupiecki Trakt", abbr: "StKupTra", x: 51, y: 12, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stary Kupiecki Trakt", abbr: "StKupTra", x: 55, y: 44, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stary Kupiecki Trakt", abbr: "StKupTra", x: 55, y: 92, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stukot Widmowych Kół", abbr: "StukWidK", x: 5, y: 5, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stukot Widmowych Kół", abbr: "StukWidK", x: 20, y: 28, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stukot Widmowych Kół", abbr: "StukWidK", x: 23, y: 61, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Stukot Widmowych Kół", abbr: "StukWidK", x: 48, y: 72, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Wertepy Rzezimieszków", abbr: "WertRzez", x: 12, y: 55, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Wertepy Rzezimieszków", abbr: "WertRzez", x: 53, y: 12, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Wertepy Rzezimieszków", abbr: "WertRzez", x: 53, y: 51, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Chata szabrowników", abbr: "ChatSzab", x: 6, y: 4, hero_name: "Złodziej", hero_abbr: "Złod", hero_level: 51 },
        { map: "Zniszczone Opactwo", abbr: "ZniOpact", x: 6, y: 46, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Uroczysko", abbr: "Urocz", x: 13, y: 26, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Uroczysko", abbr: "Urocz", x: 22, y: 53, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Uroczysko", abbr: "Urocz", x: 80, y: 33, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Uroczysko", abbr: "Urocz", x: 90, y: 9, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Uroczysko", abbr: "Urocz", x: 92, y: 50, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.1", abbr: "LG p1", x: 13, y: 16, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.2", abbr: "LG p2", x: 25, y: 20, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.2", abbr: "LG p2", x: 35, y: 9, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.2", abbr: "LG p2", x: 55, y: 17, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.3 - sala 2", abbr: "LG p3s2", x: 9, y: 18, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.3 - sala 1", abbr: "LG p3s1", x: 10, y: 16, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.3 - sala 1", abbr: "LG p3s1", x: 22, y: 41, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Lazurytowa Grota p.3 - sala 1", abbr: "LG p3s1", x: 34, y: 16, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 6, y: 34, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 17, y: 15, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 25, y: 24, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 26, y: 49, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 38, y: 34, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 41, y: 5, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 47, y: 13, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 48, y: 60, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 55, y: 50, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 58, y: 41, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 64, y: 34, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 66, y: 48, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 79, y: 22, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 86, y: 36, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Zapomniany Szlak", abbr: "ZapSzlak", x: 89, y: 51, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.1", abbr: "MG p1", x: 20, y: 52, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.1", abbr: "MG p1", x: 37, y: 41, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.1", abbr: "MG p1", x: 58, y: 13, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.1 - boczny korytarz", abbr: "MG bkor", x: 17, y: 40, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.1 - boczny korytarz", abbr: "MG bkor", x: 25, y: 35, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.1 - boczny korytarz", abbr: "MG bkor", x: 44, y: 56, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.2 - korytarz", abbr: "MG p2kor", x: 13, y: 44, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.2 - korytarz", abbr: "MG p2kor", x: 23, y: 18, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mokra Grota p.2 - korytarz", abbr: "MG p2kor", x: 36, y: 33, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 1", abbr: "GBK s1", x: 18, y: 12, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 1", abbr: "GBK s1", x: 19, y: 16, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 2", abbr: "GBK s2", x: 12, y: 19, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 2", abbr: "GBK s2", x: 33, y: 10, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 2", abbr: "GBK s2", x: 51, y: 17, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 2", abbr: "GBK s2", x: 52, y: 43, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 3", abbr: "GBK s3", x: 5, y: 15, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 3", abbr: "GBK s3", x: 28, y: 42, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 3", abbr: "GBK s3", x: 34, y: 13, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 3", abbr: "GBK s3", x: 34, y: 29, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Grota Bezszelestnych Kroków - sala 3", abbr: "GBK s3", x: 45, y: 49, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 15, y: 51, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 18, y: 7, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 30, y: 24, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 30, y: 59, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 42, y: 2, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 42, y: 16, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 42, y: 34, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 49, y: 50, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 56, y: 24, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Mroczny Przesmyk", abbr: "MroPrzes", x: 59, y: 54, hero_name: "Zły Przewodnik", hero_abbr: "Prze", hero_level: 63 },
        { map: "Skały Mroźnych Śpiewów", abbr: "SkMroźŚp", x: 8, y: 48, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Skały Mroźnych Śpiewów", abbr: "SkMroźŚp", x: 28, y: 60, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Skały Mroźnych Śpiewów", abbr: "SkMroźŚp", x: 43, y: 21, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Skały Mroźnych Śpiewów", abbr: "SkMroźŚp", x: 44, y: 39, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Cmentarzysko Szerpów", abbr: "CmenSzer", x: 43, y: 20, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Cmentarzysko Szerpów", abbr: "CmenSzer", x: 46, y: 60, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Cmentarzysko Szerpów", abbr: "CmenSzer", x: 63, y: 47, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Cmentarzysko Szerpów", abbr: "CmenSzer", x: 75, y: 55, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Andarum Ilami", abbr: "Andarum", x: 17, y: 40, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Andarum Ilami", abbr: "Andarum", x: 23, y: 55, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Andarum Ilami", abbr: "Andarum", x: 26, y: 18, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Andarum Ilami", abbr: "Andarum", x: 37, y: 20, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum", abbr: "ŚwA", x: 12, y: 10, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum", abbr: "ŚwA", x: 16, y: 26, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum", abbr: "ŚwA", x: 34, y: 10, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - zejście lewe", abbr: "ŚwA zlew", x: 15, y: 16, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - zejście prawe", abbr: "ŚwA zpra", x: 7, y: 26, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - podziemia", abbr: "ŚwA podz", x: 4, y: 33, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - podziemia", abbr: "ŚwA podz", x: 11, y: 9, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - podziemia", abbr: "ŚwA podz", x: 24, y: 21, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - podziemia", abbr: "ŚwA podz", x: 29, y: 9, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - podziemia", abbr: "ŚwA podz", x: 41, y: 19, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - podziemia", abbr: "ŚwA podz", x: 47, y: 7, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - biblioteka", abbr: "ŚwA bibl", x: 12, y: 29, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - biblioteka", abbr: "ŚwA bibl", x: 16, y: 47, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - biblioteka", abbr: "ŚwA bibl", x: 51, y: 7, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - biblioteka", abbr: "ŚwA bibl", x: 59, y: 52, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - biblioteka", abbr: "ŚwA bibl", x: 61, y: 35, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - lokum mnichów", abbr: "ŚwA lokm", x: 10, y: 17, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - lokum mnichów", abbr: "ŚwA lokm", x: 12, y: 44, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - lokum mnichów", abbr: "ŚwA lokm", x: 31, y: 13, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - lokum mnichów", abbr: "ŚwA lokm", x: 49, y: 20, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Świątynia Andarum - lokum mnichów", abbr: "ŚwA lokm", x: 51, y: 52, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.1", abbr: "KDŚ p1", x: 13, y: 35, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.1", abbr: "KDŚ p1", x: 15, y: 18, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.1", abbr: "KDŚ p1", x: 30, y: 31, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.1", abbr: "KDŚ p1", x: 37, y: 18, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.2", abbr: "KDŚ p2", x: 9, y: 12, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.2", abbr: "KDŚ p2", x: 12, y: 43, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.2", abbr: "KDŚ p2", x: 27, y: 14, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.2", abbr: "KDŚ p2", x: 42, y: 29, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.3", abbr: "KDŚ p3", x: 5, y: 41, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.3", abbr: "KDŚ p3", x: 8, y: 19, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Krypty Dusz Śniegu p.3", abbr: "KDŚ p3", x: 30, y: 29, hero_name: "Opętany Paladyn", hero_abbr: "Opek", hero_level: 74 },
        { map: "Zdradzieckie Przejście p.1", abbr: "ZdrP p1", x: 8, y: 85, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Zdradzieckie Przejście p.1", abbr: "ZdrP p1", x: 9, y: 42, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Zdradzieckie Przejście p.2", abbr: "ZdrP p2", x: 9, y: 28, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Zdradzieckie Przejście p.2", abbr: "ZdrP p2", x: 19, y: 6, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Zdradzieckie Przejście p.2", abbr: "ZdrP p2", x: 51, y: 45, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.1", abbr: "WyCh p1", x: 23, y: 14, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.1", abbr: "WyCh p1", x: 26, y: 59, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.2", abbr: "WyCh p2", x: 11, y: 20, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.2", abbr: "WyCh p2", x: 36, y: 24, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.2", abbr: "WyCh p2", x: 54, y: 47, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.3", abbr: "WyCh p3", x: 19, y: 50, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Wylęgarnia Choukkerów p.3", abbr: "WyCh p3", x: 52, y: 42, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Labirynt Margorii", abbr: "LabMar", x: 6, y: 35, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Labirynt Margorii", abbr: "LabMar", x: 29, y: 22, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Labirynt Margorii", abbr: "LabMar", x: 62, y: 42, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Labirynt Margorii", abbr: "LabMar", x: 86, y: 26, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Labirynt Margorii", abbr: "LabMar", x: 87, y: 44, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Kopalnia Margorii", abbr: "KopMar", x: 8, y: 40, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Kopalnia Margorii", abbr: "KopMar", x: 30, y: 92, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Kopalnia Margorii", abbr: "KopMar", x: 58, y: 71, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Margoria", abbr: "Marg.", x: 10, y: 47, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Margoria", abbr: "Marg.", x: 30, y: 39, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Margoria", abbr: "Marg.", x: 51, y: 39, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Margoria", abbr: "Marg.", x: 55, y: 15, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Szyb Zdrajców", abbr: "SzyZdr", x: 11, y: 34, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Szyb Zdrajców", abbr: "SzyZdr", x: 32, y: 13, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Szyb Zdrajców", abbr: "SzyZdr", x: 49, y: 47, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Ślepe Wyrobisko", abbr: "ŚleWyr", x: 23, y: 56, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Ślepe Wyrobisko", abbr: "ŚleWyr", x: 28, y: 24, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Ślepe Wyrobisko", abbr: "ŚleWyr", x: 35, y: 8, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Ślepe Wyrobisko", abbr: "ŚleWyr", x: 54, y: 28, hero_name: "Piekielny Kościej", hero_abbr: "Koś", hero_level: 85 },
        { map: "Liściaste Rozstaje", abbr: "LiśRoz", x: 12, y: 68, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Liściaste Rozstaje", abbr: "LiśRoz", x: 47, y: 11, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Liściaste Rozstaje", abbr: "LiśRoz", x: 51, y: 77, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Sosnowe Odludzie", abbr: "SosOdl", x: 4, y: 15, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Sosnowe Odludzie", abbr: "SosOdl", x: 24, y: 21, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Sosnowe Odludzie", abbr: "SosOdl", x: 31, y: 85, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Sosnowe Odludzie", abbr: "SosOdl", x: 40, y: 41, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Sosnowe Odludzie", abbr: "SosOdl", x: 41, y: 65, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Sosnowe Odludzie", abbr: "SosOdl", x: 56, y: 23, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Księżycowe Wzniesienie", abbr: "KsiWzn", x: 10, y: 25, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Księżycowe Wzniesienie", abbr: "KsiWzn", x: 15, y: 75, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Księżycowe Wzniesienie", abbr: "KsiWzn", x: 44, y: 61, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Księżycowe Wzniesienie", abbr: "KsiWzn", x: 60, y: 13, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Zapomniany Święty Gaj p.1 - sala 1", abbr: "ZŚG p1s1", x: 14, y: 8, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Trupia Przełęcz", abbr: "TruPrz", x: 16, y: 42, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Trupia Przełęcz", abbr: "TruPrz", x: 25, y: 2, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Trupia Przełęcz", abbr: "TruPrz", x: 57, y: 5, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Trupia Przełęcz", abbr: "TruPrz", x: 58, y: 78, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Zapomniany Święty Gaj p.2", abbr: "ZŚG p2", x: 16, y: 27, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Zapomniany Święty Gaj p.2", abbr: "ZŚG p2", x: 30, y: 25, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Mglista Polana Vesy", abbr: "MPV", x: 25, y: 52, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Mglista Polana Vesy", abbr: "MPV", x: 44, y: 75, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Mglista Polana Vesy", abbr: "MPV", x: 56, y: 48, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Wzgórze Płaczek", abbr: "WzgPła", x: 15, y: 49, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Wzgórze Płaczek", abbr: "WzgPła", x: 67, y: 20, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Wzgórze Płaczek", abbr: "WzgPła", x: 77, y: 31, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.1 - sala 1", abbr: "PG p1s1", x: 20, y: 21, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.1 - sala 2", abbr: "PG p1s2", x: 11, y: 15, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.1 - sala 2", abbr: "PG p1s2", x: 36, y: 42, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.2", abbr: "PG p2", x: 19, y: 34, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.2", abbr: "PG p2", x: 39, y: 32, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.2", abbr: "PG p2", x: 41, y: 8, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.2", abbr: "PG p2", x: 52, y: 50, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.3", abbr: "PG p3", x: 19, y: 34, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Płacząca Grota p.3", abbr: "PG p3", x: 20, y: 24, hero_name: "Koziec Mąciciel Ścieżek", hero_abbr: "Koz", hero_level: 94 },
        { map: "Błędny Szlak", abbr: "BłędSzl", x: 8, y: 44, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Błędny Szlak", abbr: "BłędSzl", x: 22, y: 5, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Błędny Szlak", abbr: "BłędSzl", x: 40, y: 42, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Błędny Szlak", abbr: "BłędSzl", x: 75, y: 23, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zawiły Bór", abbr: "ZawBór", x: 14, y: 43, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zawiły Bór", abbr: "ZawBór", x: 47, y: 39, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zawiły Bór", abbr: "ZawBór", x: 48, y: 5, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zawiły Bór", abbr: "ZawBór", x: 87, y: 8, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Iglaste Ścieżki", abbr: "IglŚc", x: 23, y: 10, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Iglaste Ścieżki", abbr: "IglŚc", x: 29, y: 56, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Iglaste Ścieżki", abbr: "IglŚc", x: 68, y: 47, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Iglaste Ścieżki", abbr: "IglŚc", x: 83, y: 9, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Iglaste Ścieżki", abbr: "IglŚc", x: 88, y: 40, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Selva Oscura", abbr: "SelOsc", x: 23, y: 35, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Selva Oscura", abbr: "SelOsc", x: 24, y: 19, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Selva Oscura", abbr: "SelOsc", x: 72, y: 37, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Selva Oscura", abbr: "SelOsc", x: 76, y: 12, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Gadzia Kotlina", abbr: "GadKot", x: 10, y: 32, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Gadzia Kotlina", abbr: "GadKot", x: 38, y: 43, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Gadzia Kotlina", abbr: "GadKot", x: 50, y: 26, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Gadzia Kotlina", abbr: "GadKot", x: 60, y: 49, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Gadzia Kotlina", abbr: "GadKot", x: 72, y: 14, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Mglista Polana Vesy", abbr: "MPV", x: 7, y: 12, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Mglista Polana Vesy", abbr: "MPV", x: 44, y: 11, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Dolina Centaurów", abbr: "DolCen", x: 11, y: 54, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Dolina Centaurów", abbr: "DolCen", x: 56, y: 44, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Dolina Centaurów", abbr: "DolCen", x: 69, y: 16, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Dolina Centaurów", abbr: "DolCen", x: 84, y: 46, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Złowrogie Bagna", abbr: "ZłoBag", x: 10, y: 10, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Złowrogie Bagna", abbr: "ZłoBag", x: 23, y: 39, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Złowrogie Bagna", abbr: "ZłoBag", x: 52, y: 20, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Złowrogie Bagna", abbr: "ZłoBag", x: 53, y: 41, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 1", abbr: "ZŚ p1s1", x: 5, y: 12, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 1", abbr: "ZŚ p1s1", x: 18, y: 35, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 1", abbr: "ZŚ p1s1", x: 33, y: 21, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 2", abbr: "ZŚ p1s2", x: 17, y: 6, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 2", abbr: "ZŚ p1s2", x: 36, y: 17, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 3", abbr: "ZŚ p1s3", x: 7, y: 7, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 3", abbr: "ZŚ p1s3", x: 28, y: 28, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.1 - sala 3", abbr: "ZŚ p1s3", x: 38, y: 11, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.2", abbr: "ZŚ p2", x: 29, y: 14, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Zagrzybiałe Ścieżki p.2", abbr: "ZŚ p2", x: 30, y: 43, hero_name: "Kochanka Nocy", hero_abbr: "Koch", hero_level: 102 },
        { map: "Stare Sioło", abbr: "StaSioło", x: 84, y: 44, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Stare Sioło", abbr: "StaSioło", x: 91, y: 7, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Sucha Dolina", abbr: "SuchaDol", x: 28, y: 34, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Sucha Dolina", abbr: "SuchaDol", x: 31, y: 77, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Sucha Dolina", abbr: "SuchaDol", x: 44, y: 23, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Wioska Rybacka", abbr: "WioskRyb", x: 23, y: 15, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Wioska Rybacka", abbr: "WioskRyb", x: 85, y: 5, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Wioska Rybacka", abbr: "WioskRyb", x: 88, y: 43, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Płaskowyż Arpan", abbr: "PłaskArp", x: 37, y: 32, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Płaskowyż Arpan", abbr: "PłaskArp", x: 71, y: 15, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Płaskowyż Arpan", abbr: "PłaskArp", x: 73, y: 50, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Skalne Cmentarzysko p.1", abbr: "SkCem p1", x: 5, y: 17, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Skalne Cmentarzysko p.2", abbr: "SkCem p2", x: 8, y: 40, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Skalne Cmentarzysko p.2", abbr: "SkCem p2", x: 40, y: 20, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Skalne Cmentarzysko p.3", abbr: "SkCem p3", x: 19, y: 44, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Skalne Cmentarzysko p.3", abbr: "SkCem p3", x: 35, y: 39, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Skalne Cmentarzysko p.3", abbr: "SkCem p3", x: 55, y: 10, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Oaza Siedmiu Wichrów", abbr: "Oaz7Wich", x: 22, y: 67, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Oaza Siedmiu Wichrów", abbr: "Oaz7Wich", x: 32, y: 42, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Oaza Siedmiu Wichrów", abbr: "Oaz7Wich", x: 48, y: 35, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Oaza Siedmiu Wichrów", abbr: "Oaz7Wich", x: 49, y: 72, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Złote Piaski", abbr: "ZłotePia", x: 11, y: 60, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Złote Piaski", abbr: "ZłotePia", x: 13, y: 29, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Złote Piaski", abbr: "ZłotePia", x: 18, y: 69, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Złote Piaski", abbr: "ZłotePia", x: 44, y: 7, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Złote Piaski", abbr: "ZłotePia", x: 44, y: 55, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Piramida Pustynnego Władcy p.1", abbr: "PirPW p1", x: 9, y: 11, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Piramida Pustynnego Władcy p.1", abbr: "PirPW p1", x: 41, y: 35, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Piramida Pustynnego Władcy p.2", abbr: "PirPW p2", x: 19, y: 24, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ruiny Pustynnych Burz", abbr: "RuinyPBu", x: 22, y: 23, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ruiny Pustynnych Burz", abbr: "RuinyPBu", x: 23, y: 83, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ruiny Pustynnych Burz", abbr: "RuinyPBu", x: 44, y: 70, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ciche Rumowiska", abbr: "CicheRum", x: 19, y: 55, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ciche Rumowiska", abbr: "CicheRum", x: 22, y: 3, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ciche Rumowiska", abbr: "CicheRum", x: 26, y: 27, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ciche Rumowiska", abbr: "CicheRum", x: 64, y: 48, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ciche Rumowiska", abbr: "CicheRum", x: 80, y: 47, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Ciche Rumowiska", abbr: "CicheRum", x: 85, y: 11, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Dolina Suchych Łez", abbr: "DSuchŁez", x: 34, y: 52, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Dolina Suchych Łez", abbr: "DSuchŁez", x: 56, y: 12, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Dolina Suchych Łez", abbr: "DSuchŁez", x: 61, y: 61, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Dolina Suchych Łez", abbr: "DSuchŁez", x: 79, y: 35, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Dolina Suchych Łez", abbr: "DSuchŁez", x: 80, y: 16, hero_name: "Książę Kasim", hero_abbr: "Kas", hero_level: 116 },
        { map: "Agia Triada", abbr: "AgiaTria", x: 10, y: 32, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Agia Triada", abbr: "AgiaTria", x: 23, y: 72, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Agia Triada", abbr: "AgiaTria", x: 46, y: 22, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Agia Triada", abbr: "AgiaTria", x: 58, y: 35, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Agia Triada", abbr: "AgiaTria", x: 77, y: 44, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - świątynia", abbr: "KR świąt", x: 11, y: 15, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - świątynia", abbr: "KR świąt", x: 38, y: 15, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - wirydarz", abbr: "KR wiryd", x: 8, y: 14, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - cela opata", abbr: "KR cela", x: 11, y: 5, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - wieża płn.-wsch. p.1", abbr: "KR pw p1", x: 6, y: 5, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - strych p.1", abbr: "KR st p1", x: 19, y: 20, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - strych p.2", abbr: "KR st p2", x: 20, y: 19, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - strych p.2", abbr: "KR st p2", x: 36, y: 20, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - kapitularz", abbr: "KR kapit", x: 12, y: 15, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - fraternia", abbr: "KR frat", x: 13, y: 16, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - refektarz", abbr: "KR refek", x: 9, y: 13, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - dormitoria", abbr: "KR dorm", x: 3, y: 16, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - pomieszczenia gospodarcze", abbr: "KR pgosp", x: 11, y: 13, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - klasztorny browar", abbr: "KR brow", x: 11, y: 7, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Klasztor Różanitów - dzwonnica", abbr: "KR dzwon", x: 12, y: 12, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Archipelag Bremus An", abbr: "BremusAn", x: 10, y: 15, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Archipelag Bremus An", abbr: "BremusAn", x: 30, y: 28, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Archipelag Bremus An", abbr: "BremusAn", x: 48, y: 35, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Archipelag Bremus An", abbr: "BremusAn", x: 75, y: 41, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Rem", abbr: "Rem", x: 9, y: 22, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Rem", abbr: "Rem", x: 22, y: 55, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Rem", abbr: "Rem", x: 25, y: 30, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Rem", abbr: "Rem", x: 39, y: 46, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Rem", abbr: "Rem", x: 57, y: 8, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Rem", abbr: "Rem", x: 82, y: 29, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Caneum", abbr: "Caneum", x: 23, y: 35, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Caneum", abbr: "Caneum", x: 42, y: 8, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Caneum", abbr: "Caneum", x: 45, y: 54, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Caneum", abbr: "Caneum", x: 57, y: 88, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Caneum", abbr: "Caneum", x: 81, y: 27, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Magradit", abbr: "Magradit", x: 12, y: 36, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Magradit", abbr: "Magradit", x: 15, y: 78, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Magradit", abbr: "Magradit", x: 60, y: 52, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Magradit", abbr: "Magradit", x: 80, y: 81, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Magradit", abbr: "Magradit", x: 82, y: 36, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Wraków", abbr: "WyspWrak", x: 5, y: 89, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Wraków", abbr: "WyspWrak", x: 15, y: 67, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Wraków", abbr: "WyspWrak", x: 16, y: 15, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Wyspa Wraków", abbr: "WyspWrak", x: 38, y: 32, hero_name: "Święty Braciszek", hero_abbr: "Brat", hero_level: 123 },
        { map: "Latarniane Wybrzeże", abbr: "LatWybrz", x: 6, y: 59, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Latarniane Wybrzeże", abbr: "LatWybrz", x: 18, y: 31, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Latarniane Wybrzeże", abbr: "LatWybrz", x: 21, y: 4, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Latarniane Wybrzeże", abbr: "LatWybrz", x: 47, y: 20, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Latarniane Wybrzeże", abbr: "LatWybrz", x: 79, y: 55, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Latarniane Wybrzeże", abbr: "LatWybrz", x: 87, y: 58, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 1", abbr: "KNora s1", x: 9, y: 15, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 1", abbr: "KNora s1", x: 23, y: 21, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 2", abbr: "KNora s2", x: 10, y: 25, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 2", abbr: "KNora s2", x: 20, y: 13, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 2", abbr: "KNora s2", x: 25, y: 20, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 3", abbr: "KNora s3", x: 13, y: 25, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 3", abbr: "KNora s3", x: 14, y: 7, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 4", abbr: "KNora s4", x: 15, y: 26, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 4", abbr: "KNora s4", x: 21, y: 16, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 5", abbr: "KNora s5", x: 23, y: 37, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 5", abbr: "KNora s5", x: 29, y: 11, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 6", abbr: "KNora s6", x: 12, y: 26, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Korsarska Nora - sala 6", abbr: "KNora s6", x: 28, y: 12, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ukryta Grota Morskich Diabłów - korytarz", abbr: "UGMD kor", x: 21, y: 14, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ukryta Grota Morskich Diabłów - arsenał", abbr: "UGMD ars", x: 18, y: 10, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ukryta Grota Morskich Diabłów - arsenał", abbr: "UGMD ars", x: 19, y: 21, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ukryta Grota Morskich Diabłów", abbr: "UGMD", x: 20, y: 18, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ukryta Grota Morskich Diabłów", abbr: "UGMD", x: 29, y: 38, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ukryta Grota Morskich Diabłów", abbr: "UGMD", x: 46, y: 22, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 3, y: 61, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 7, y: 11, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 8, y: 29, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 28, y: 76, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 38, y: 35, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 55, y: 11, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Dolina Pustynnych Kręgów", abbr: "DolPustK", x: 58, y: 82, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piachy Zniewolonych", abbr: "PiachyZn", x: 7, y: 18, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piachy Zniewolonych", abbr: "PiachyZn", x: 25, y: 42, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piachy Zniewolonych", abbr: "PiachyZn", x: 47, y: 52, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piachy Zniewolonych", abbr: "PiachyZn", x: 54, y: 12, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piachy Zniewolonych", abbr: "PiachyZn", x: 59, y: 28, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piachy Zniewolonych", abbr: "PiachyZn", x: 90, y: 16, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piaszczysta Grota p.1 - sala 1", abbr: "PG p1s1", x: 16, y: 42, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piaszczysta Grota p.1 - sala 1", abbr: "PG p1s1", x: 27, y: 6, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Piaszczysta Grota p.1 - sala 1", abbr: "PG p1s1", x: 37, y: 23, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 4, y: 26, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 4, y: 59, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 8, y: 6, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 28, y: 44, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 43, y: 16, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 80, y: 24, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 84, y: 61, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Ruchome Piaski", abbr: "RuPiaski", x: 90, y: 3, hero_name: "Złoty Roger", hero_abbr: "Rog", hero_level: 135 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 3, y: 36, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 5, y: 62, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 20, y: 84, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 26, y: 80, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 27, y: 33, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 30, y: 66, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 42, y: 38, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 46, y: 67, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjący Wąwóz", abbr: "WyjWąwóz", x: 52, y: 19, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjąca Jaskinia", abbr: "WyjJask", x: 8, y: 53, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjąca Jaskinia", abbr: "WyjJask", x: 29, y: 37, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjąca Jaskinia", abbr: "WyjJask", x: 45, y: 26, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjąca Jaskinia", abbr: "WyjJask", x: 49, y: 15, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wyjąca Jaskinia", abbr: "WyjJask", x: 54, y: 57, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 8, y: 8, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 8, y: 27, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 12, y: 55, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 28, y: 17, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 37, y: 83, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 55, y: 74, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 56, y: 3, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Babi Wzgórek", abbr: "BWzgórek", x: 57, y: 41, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.1", abbr: "GórPi p1", x: 11, y: 13, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.1", abbr: "GórPi p1", x: 32, y: 38, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.1", abbr: "GórPi p1", x: 39, y: 26, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.2", abbr: "GórPi p2", x: 22, y: 38, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.2", abbr: "GórPi p2", x: 23, y: 15, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.2", abbr: "GórPi p2", x: 23, y: 28, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.2", abbr: "GórPi p2", x: 32, y: 14, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.3", abbr: "GórPi p3", x: 15, y: 32, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.3", abbr: "GórPi p3", x: 21, y: 14, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.3", abbr: "GórPi p3", x: 30, y: 52, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.3", abbr: "GórPi p3", x: 36, y: 28, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.3", abbr: "GórPi p3", x: 50, y: 22, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralska Pieczara p.3", abbr: "GórPi p3", x: 51, y: 59, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 2, y: 5, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 3, y: 45, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 17, y: 86, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 22, y: 37, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 41, y: 90, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 45, y: 13, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Góralskie Przejście", abbr: "GórPrzej", x: 52, y: 62, hero_name: "Baca bez Łowiec", hero_abbr: "Baca", hero_level: 144 },
        { map: "Wiedźmie Kotłowisko", abbr: "WiedźKot", x: 7, y: 45, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Wiedźmie Kotłowisko", abbr: "WiedźKot", x: 12, y: 9, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Wiedźmie Kotłowisko", abbr: "WiedźKot", x: 52, y: 22, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Wiedźmie Kotłowisko", abbr: "WiedźKot", x: 79, y: 12, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Wiedźmie Kotłowisko", abbr: "WiedźKot", x: 91, y: 44, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Upiorna Droga", abbr: "UpiornaD", x: 25, y: 6, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Upiorna Droga", abbr: "UpiornaD", x: 26, y: 39, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Upiorna Droga", abbr: "UpiornaD", x: 65, y: 55, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Upiorna Droga", abbr: "UpiornaD", x: 66, y: 7, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Upiorna Droga", abbr: "UpiornaD", x: 89, y: 22, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Sabatowe Góry", abbr: "SabatGór", x: 18, y: 55, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Sabatowe Góry", abbr: "SabatGór", x: 32, y: 18, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Sabatowe Góry", abbr: "SabatGór", x: 36, y: 52, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Sabatowe Góry", abbr: "SabatGór", x: 42, y: 14, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Sabatowe Góry", abbr: "SabatGór", x: 52, y: 41, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 3, y: 56, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 14, y: 13, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 34, y: 27, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 46, y: 11, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 59, y: 57, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 64, y: 17, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Tristam", abbr: "Tristam", x: 89, y: 35, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Splądrowana kaplica", abbr: "SplądKap", x: 12, y: 7, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Ograbiona świątynia", abbr: "OgrŚwiąt", x: 7, y: 9, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Ograbiona świątynia", abbr: "OgrŚwiąt", x: 19, y: 6, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Splugawiona kaplica", abbr: "SplugKap", x: 6, y: 5, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom Atalii", abbr: "DAtalii", x: 6, y: 9, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Opuszczone więzienie", abbr: "OpWięz", x: 10, y: 5, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom Amry", abbr: "Dom Amry", x: 5, y: 6, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom Amry", abbr: "Dom Amry", x: 11, y: 8, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom nawiedzonej wiedźmy", abbr: "DNawWied", x: 4, y: 9, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom nawiedzonej wiedźmy", abbr: "DNawWied", x: 11, y: 5, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom Adariel", abbr: "DAdariel", x: 11, y: 7, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom starej czarownicy", abbr: "DStCzar", x: 16, y: 14, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom starej czarownicy", abbr: "DStCzar", x: 17, y: 8, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Dom czarnej magii", abbr: "DCzMagii", x: 8, y: 6, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Magazyn mioteł", abbr: "MagazMio", x: 11, y: 6, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Lochy Tristam", abbr: "LochyTri", x: 13, y: 48, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Lochy Tristam", abbr: "LochyTri", x: 30, y: 59, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Lochy Tristam", abbr: "LochyTri", x: 39, y: 28, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Lochy Tristam", abbr: "LochyTri", x: 52, y: 48, hero_name: "Czarująca Atalia", hero_abbr: "Ata", hero_level: 157 },
        { map: "Orcza Wyżyna", abbr: "OrWyż", x: 4, y: 21, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Orcza Wyżyna", abbr: "OrWyż", x: 16, y: 9, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Orcza Wyżyna", abbr: "OrWyż", x: 25, y: 40, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Orcza Wyżyna", abbr: "OrWyż", x: 35, y: 3, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Orcza Wyżyna", abbr: "OrWyż", x: 68, y: 17, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.1 s.1", abbr: "GOS p1s1", x: 14, y: 28, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.1 s.1", abbr: "GOS p1s1", x: 18, y: 13, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.1 s.2", abbr: "GOS p1s2", x: 9, y: 18, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.1 s.2", abbr: "GOS p1s2", x: 21, y: 10, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.1 s.2", abbr: "GOS p1s2", x: 28, y: 16, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.2 s.1", abbr: "GOS p2s1", x: 6, y: 16, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.2 s.1", abbr: "GOS p2s1", x: 10, y: 23, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.2 s.1", abbr: "GOS p2s1", x: 12, y: 7, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.2 s.2", abbr: "GOS p2s2", x: 16, y: 8, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.2 s.2", abbr: "GOS p2s2", x: 18, y: 17, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczych Szamanów p.2 s.2", abbr: "GOS p2s2", x: 22, y: 35, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 3, y: 13, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 18, y: 40, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 21, y: 3, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 22, y: 27, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 32, y: 45, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 42, y: 6, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 42, y: 25, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 49, y: 37, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 52, y: 17, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 62, y: 5, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Osada Czerwonych Orków", abbr: "OsCzeOrk", x: 63, y: 12, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.1", abbr: "GOH p1s1", x: 7, y: 7, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.1", abbr: "GOH p1s1", x: 16, y: 19, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.1", abbr: "GOH p1s1", x: 25, y: 19, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.1", abbr: "GOH p1s1", x: 33, y: 28, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.2", abbr: "GOH p1s2", x: 10, y: 12, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.2", abbr: "GOH p1s2", x: 21, y: 23, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.1 s.2", abbr: "GOH p1s2", x: 34, y: 35, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.1", abbr: "GOH p2s1", x: 14, y: 32, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.1", abbr: "GOH p2s1", x: 17, y: 9, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.1", abbr: "GOH p2s1", x: 39, y: 14, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.2", abbr: "GOH p2s2", x: 15, y: 26, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.2", abbr: "GOH p2s2", x: 27, y: 16, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.2", abbr: "GOH p2s2", x: 33, y: 39, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Grota Orczej Hordy p.2 s.2", abbr: "GOH p2s2", x: 34, y: 20, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Kurhany Zwyciężonych", abbr: "KurhZwyc", x: 26, y: 53, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Kurhany Zwyciężonych", abbr: "KurhZwyc", x: 63, y: 56, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Kurhany Zwyciężonych", abbr: "KurhZwyc", x: 74, y: 38, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Kurhany Zwyciężonych", abbr: "KurhZwyc", x: 77, y: 14, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Kurhany Zwyciężonych", abbr: "KurhZwyc", x: 83, y: 54, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Włości rodu Kruzo", abbr: "WłRKruzo", x: 15, y: 8, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Włości rodu Kruzo", abbr: "WłRKruzo", x: 25, y: 36, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Włości rodu Kruzo", abbr: "WłRKruzo", x: 29, y: 3, hero_name: "Obłąkany Łowca Orków", hero_abbr: "Obł", hero_level: 165 },
        { map: "Kryształowa Grota p.1", abbr: "KG p1", x: 12, y: 11, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.1", abbr: "KG p1", x: 33, y: 46, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.1", abbr: "KG p1", x: 35, y: 28, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.1", abbr: "KG p1", x: 55, y: 6, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 1", abbr: "KG p2s1", x: 5, y: 25, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 1", abbr: "KG p2s1", x: 27, y: 9, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 1", abbr: "KG p2s1", x: 35, y: 57, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 1", abbr: "KG p2s1", x: 36, y: 40, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 2", abbr: "KG p2s2", x: 8, y: 36, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 2", abbr: "KG p2s2", x: 33, y: 19, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 2", abbr: "KG p2s2", x: 43, y: 13, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.2 - sala 2", abbr: "KG p2s2", x: 52, y: 40, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota - Sala Smutku", abbr: "KG SalSm", x: 13, y: 12, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota - Sala Smutku", abbr: "KG SalSm", x: 15, y: 34, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota - Sala Smutku", abbr: "KG SalSm", x: 18, y: 23, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota - Sala Smutku", abbr: "KG SalSm", x: 32, y: 20, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 1", abbr: "KG p3s1", x: 10, y: 11, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 1", abbr: "KG p3s1", x: 10, y: 40, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 1", abbr: "KG p3s1", x: 30, y: 33, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 1", abbr: "KG p3s1", x: 50, y: 44, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 2", abbr: "KG p3s2", x: 9, y: 45, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 2", abbr: "KG p3s2", x: 17, y: 12, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.3 - sala 2", abbr: "KG p3s2", x: 38, y: 40, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.4", abbr: "KG p4", x: 19, y: 54, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.4", abbr: "KG p4", x: 38, y: 9, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.4", abbr: "KG p4", x: 51, y: 32, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.4", abbr: "KG p4", x: 52, y: 56, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.5", abbr: "KG p5", x: 18, y: 32, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.5", abbr: "KG p5", x: 19, y: 45, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.5", abbr: "KG p5", x: 55, y: 34, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.6", abbr: "KG p6", x: 14, y: 49, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.6", abbr: "KG p6", x: 42, y: 50, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Kryształowa Grota p.6", abbr: "KG p6", x: 46, y: 15, hero_name: "Lichwiarz Grauhaz", hero_abbr: "Lich", hero_level: 177 },
        { map: "Grań Gawronich Piór", abbr: "GrańGP", x: 56, y: 31, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Grań Gawronich Piór", abbr: "GrańGawP", x: 87, y: 17, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Grań Gawronich Piór", abbr: "GrańGawP", x: 87, y: 53, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 7, y: 22, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 17, y: 49, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 20, y: 12, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 23, y: 58, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 25, y: 25, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 29, y: 10, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 41, y: 25, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 60, y: 37, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 63, y: 10, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 68, y: 35, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 71, y: 20, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 73, y: 23, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 78, y: 44, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Ruiny Tass Zhil", abbr: "RuinyTZh", x: 88, y: 9, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 9, y: 8, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 16, y: 54, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 21, y: 17, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 41, y: 56, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 42, y: 4, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 48, y: 14, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Błota Sham Al", abbr: "BłotaShA", x: 56, y: 5, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 7, y: 12, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 13, y: 12, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 24, y: 93, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 32, y: 73, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 41, y: 11, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 50, y: 62, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 57, y: 91, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 58, y: 20, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 59, y: 9, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Głusza Świstu", abbr: "GłuszŚwi", x: 60, y: 78, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Las Porywów Wiatru", abbr: "LasPWiat", x: 6, y: 13, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Las Porywów Wiatru", abbr: "LasPWiat", x: 29, y: 52, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Las Porywów Wiatru", abbr: "LasPWiat", x: 35, y: 15, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Las Porywów Wiatru", abbr: "LasPWiat", x: 41, y: 37, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Las Porywów Wiatru", abbr: "LasPWiat", x: 49, y: 61, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Kwieciste Kresy", abbr: "KwieKres", x: 29, y: 55, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Kwieciste Kresy", abbr: "KwieKres", x: 51, y: 50, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Kwieciste Kresy", abbr: "KwieKres", x: 66, y: 8, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Kwieciste Kresy", abbr: "KwieKres", x: 75, y: 11, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Kwieciste Kresy", abbr: "KwieKres", x: 76, y: 25, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Kwieciste Kresy", abbr: "KwieKres", x: 80, y: 54, hero_name: "Viviana Nandin", hero_abbr: "Viv", hero_level: 185 },
        { map: "Thuzal", abbr: "Thuzal", x: 2, y: 53, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Thuzal", abbr: "Thuzal", x: 9, y: 32, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Gildia Teologów", abbr: "GTeol", x: 5, y: 5, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Gildia Teologów - korytarz za ołtarzem", abbr: "GTeol kor", x: 15, y: 8, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Gildia Wynalazców", abbr: "GWyna", x: 26, y: 20, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Żołnierski Korytarz", abbr: "ŻołKor", x: 8, y: 6, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Grań Gawronich Piór", abbr: "GrańGawP", x: 5, y: 37, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Grań Gawronich Piór", abbr: "GrańGawP", x: 11, y: 5, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Grań Gawronich Piór", abbr: "GrańGawP", x: 53, y: 12, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Grań Gawronich Piór", abbr: "GrańGawP", x: 80, y: 13, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Szczerba Samobójców", abbr: "SzczSam", x: 10, y: 45, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Szczerba Samobójców", abbr: "SzczSam", x: 65, y: 38, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Szczerba Samobójców", abbr: "SzczSam", x: 89, y: 41, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Baszta Puchacza", abbr: "BaszPuch", x: 6, y: 8, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Baszta Sowy p.1", abbr: "BaszS p1", x: 7, y: 7, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Sztab Dowódczy", abbr: "SztabDow", x: 4, y: 8, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Przysiółek Valmirów", abbr: "PrzyValm", x: 13, y: 49, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Przysiółek Valmirów", abbr: "PrzyValm", x: 35, y: 36, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Przysiółek Valmirów", abbr: "PrzyValm", x: 56, y: 12, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Śnieżna Granica", abbr: "ŚnieżGra", x: 54, y: 55, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Śnieżycowy Las", abbr: "ŚnieżLas", x: 9, y: 7, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Śnieżycowy Las", abbr: "ŚnieżLas", x: 30, y: 55, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Śnieżycowy Las", abbr: "ŚnieżLas", x: 67, y: 20, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Nithal", abbr: "Nithal", x: 22, y: 3, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Cytadela", abbr: "Cytadela", x: 11, y: 5, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Podgrodzie Nithal", abbr: "PodgNith", x: 17, y: 53, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Zachodnia Rubież", abbr: "ZachRub", x: 90, y: 9, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Zachodnia Rubież", abbr: "ZachRub", x: 93, y: 61, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Winnica Meflakasti", abbr: "WinnMefl", x: 14, y: 4, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Winnica Meflakasti", abbr: "WinnMefl", x: 91, y: 33, hero_name: "Mulher Ma", hero_abbr: "Mul", hero_level: 197 },
        { map: "Przedsionek Kultu", abbr: "PrzedKul", x: 9, y: 9, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Przedsionek Kultu", abbr: "PrzedKul", x: 26, y: 26, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Mroczne Komnaty", abbr: "MroczKom", x: 42, y: 26, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Mroczne Komnaty", abbr: "MroczKom", x: 52, y: 9, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Przerażające Sypialnie", abbr: "PrzerSyp", x: 10, y: 36, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Przerażające Sypialnie", abbr: "PrzerSyp", x: 58, y: 20, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Przerażające Sypialnie", abbr: "PrzerSyp", x: 59, y: 51, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Tajemnicza Siedziba", abbr: "TajSiedz", x: 9, y: 15, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Tajemnicza Siedziba", abbr: "TajSiedz", x: 48, y: 45, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Spowiedzi Konających", abbr: "SalaSpKo", x: 7, y: 10, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Spowiedzi Konających", abbr: "SalaSpKo", x: 9, y: 51, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Spowiedzi Konających", abbr: "SalaSpKo", x: 54, y: 51, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Spowiedzi Konających", abbr: "SalaSpKo", x: 57, y: 10, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Tysiąca Świec", abbr: "SalaTysŚ", x: 9, y: 7, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Tysiąca Świec", abbr: "SalaTysŚ", x: 17, y: 27, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Tysiąca Świec", abbr: "SalaTysŚ", x: 47, y: 30, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Tysiąca Świec", abbr: "SalaTysŚ", x: 72, y: 26, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sala Tysiąca Świec", abbr: "SalaTysŚ", x: 89, y: 21, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Lochy Kultu", abbr: "LochKult", x: 22, y: 31, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Lochy Kultu", abbr: "LochKult", x: 45, y: 51, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Lochy Kultu", abbr: "LochKult", x: 52, y: 9, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sale Rozdzierania", abbr: "SaleRozd", x: 11, y: 13, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Sale Rozdzierania", abbr: "SaleRozd", x: 13, y: 60, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Korytarz Ostatnich Nadziei", abbr: "KorOstNa", x: 24, y: 15, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Korytarz Ostatnich Nadziei", abbr: "KorOstNa", x: 70, y: 15, hero_name: "Demonis Pan Nicości", hero_abbr: "Dem", hero_level: 210 },
        { map: "Zawodzące Kaskady", abbr: "ZawKask", x: 14, y: 10, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Zawodzące Kaskady", abbr: "ZawKask", x: 63, y: 9, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Skryty Azyl", abbr: "SkryAzyl", x: 14, y: 50, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Skryty Azyl", abbr: "SkryAzyl", x: 32, y: 33, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Skryty Azyl", abbr: "SkryAzyl", x: 53, y: 51, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Skryty Azyl", abbr: "SkryAzyl", x: 57, y: 34, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Skryty Azyl", abbr: "SkryAzyl", x: 87, y: 59, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Jaszczurze Korytarze p.3 - sala 2", abbr: "JK p3s2", x: 9, y: 18, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Złota Dąbrowa", abbr: "ZłotaDąb", x: 40, y: 37, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Złota Dąbrowa", abbr: "ZłotaDąb", x: 53, y: 7, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Złota Dąbrowa", abbr: "ZłotaDąb", x: 63, y: 23, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Złota Dąbrowa", abbr: "ZłotaDąb", x: 63, y: 50, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Złota Dąbrowa", abbr: "ZłotaDąb", x: 81, y: 36, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Złota Dąbrowa", abbr: "ZłotaDąb", x: 91, y: 10, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Mglisty Las", abbr: "MglisLas", x: 2, y: 25, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Mglisty Las", abbr: "MglisLas", x: 30, y: 20, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Mglisty Las", abbr: "MglisLas", x: 51, y: 29, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Mglisty Las", abbr: "MglisLas", x: 77, y: 42, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grota Porośniętych Stalagmitów - sala boczna", abbr: "GPoSt sb", x: 20, y: 23, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grota Porośniętych Stalagmitów - sala boczna", abbr: "GPoSt sb", x: 37, y: 26, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Dolina Pełznącego Krzyku", abbr: "DolPełzK", x: 11, y: 24, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Dolina Pełznącego Krzyku", abbr: "DolPełzK", x: 14, y: 4, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Dolina Pełznącego Krzyku", abbr: "DolPełzK", x: 29, y: 47, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Dolina Pełznącego Krzyku", abbr: "DolPełzK", x: 34, y: 19, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Dolina Pełznącego Krzyku", abbr: "DolPełzK", x: 50, y: 57, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Dolina Pełznącego Krzyku", abbr: "DolPełzK", x: 58, y: 34, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 12, y: 52, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 24, y: 43, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 24, y: 68, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 29, y: 7, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 37, y: 53, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 43, y: 29, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 47, y: 11, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 50, y: 76, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Grzęzawisko Rozpaczy", abbr: "GrzęRozp", x: 57, y: 28, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Zatrute Torfowiska", abbr: "ZatrTorf", x: 23, y: 9, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Zatrute Torfowiska", abbr: "ZatrTorf", x: 33, y: 29, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Zatrute Torfowiska", abbr: "ZatrTorf", x: 49, y: 39, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Zatrute Torfowiska", abbr: "ZatrTorf", x: 57, y: 14, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Zatrute Torfowiska", abbr: "ZatrTorf", x: 57, y: 50, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Gnijące Topielisko", abbr: "GnTopiel", x: 18, y: 57, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Gnijące Topielisko", abbr: "GnTopiel", x: 37, y: 83, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Gnijące Topielisko", abbr: "GnTopiel", x: 38, y: 56, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Gnijące Topielisko", abbr: "GnTopiel", x: 47, y: 46, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Gnijące Topielisko", abbr: "GnTopiel", x: 50, y: 87, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 8, y: 49, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 8, y: 78, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 10, y: 7, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 24, y: 46, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 31, y: 78, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 39, y: 51, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 52, y: 60, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Bagna Umarłych", abbr: "BagnUmar", x: 55, y: 80, hero_name: "Vapor Veneno", hero_abbr: "Vap", hero_level: 227 },
        { map: "Wąwóz Zakorzenionych Dusz", abbr: "WZakDusz", x: 33, y: 28, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Wąwóz Zakorzenionych Dusz", abbr: "WZakDusz", x: 75, y: 27, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Wąwóz Zakorzenionych Dusz", abbr: "WZakDusz", x: 85, y: 50, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota p.1 - sala 1", abbr: "KG p1s1", x: 7, y: 13, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota p.1 - sala 2", abbr: "KG p1s2", x: 11, y: 18, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota p.1 - sala 3", abbr: "KG p1s3", x: 36, y: 22, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota p.2 - sala 1", abbr: "KG p2s1", x: 17, y: 17, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota p.2 - sala 2", abbr: "KG p2s2", x: 12, y: 19, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota p.2 - sala 3", abbr: "KG p2s3", x: 23, y: 27, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota - sala boczna", abbr: "KG sbocz", x: 9, y: 12, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Krzaczasta Grota - korytarz", abbr: "KG koryt", x: 20, y: 23, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Urwisko Zdrewniałych", abbr: "UrwZdrew", x: 11, y: 21, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Urwisko Zdrewniałych", abbr: "UrwZdrew", x: 28, y: 28, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Urwisko Zdrewniałych", abbr: "UrwZdrew", x: 41, y: 46, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Urwisko Zdrewniałych", abbr: "UrwZdrew", x: 80, y: 50, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Regiel Zabłąkanych", abbr: "RegielZa", x: 40, y: 8, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Regiel Zabłąkanych", abbr: "RegielZa", x: 58, y: 26, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Regiel Zabłąkanych", abbr: "RegielZa", x: 60, y: 50, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Źródło Zakorzenionego Ludu", abbr: "ŹrZakLud", x: 2, y: 31, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Źródło Zakorzenionego Ludu", abbr: "ŹrZakLud", x: 31, y: 83, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 1", abbr: "JKC p1s1", x: 7, y: 57, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 1", abbr: "JKC p1s1", x: 39, y: 11, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 1", abbr: "JKC p1s1", x: 52, y: 45, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 2", abbr: "JKC p1s2", x: 30, y: 9, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 3", abbr: "JKC p1s3", x: 17, y: 17, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 4", abbr: "JKC p1s4", x: 21, y: 8, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.1 - sala 4", abbr: "JKC p1s4", x: 52, y: 22, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.2 - sala 1", abbr: "JKC p2s1", x: 11, y: 15, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Jaskinia Korzennego Czaru p.2 - sala 2", abbr: "JKC p2s2", x: 13, y: 11, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Piaskowa Gęstwina", abbr: "PiasGęst", x: 34, y: 11, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Piaskowa Gęstwina", abbr: "PiasGęst", x: 46, y: 48, hero_name: "Dęborożec", hero_abbr: "Dębo", hero_level: 242 },
        { map: "Altepetl Mahoptekan", abbr: "AltMaho", x: 6, y: 56, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Altepetl Mahoptekan", abbr: "AltMaho", x: 7, y: 71, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Altepetl Mahoptekan", abbr: "AltMaho", x: 8, y: 19, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Altepetl Mahoptekan", abbr: "AltMaho", x: 54, y: 5, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.2", abbr: "WMict p2", x: 19, y: 8, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.3", abbr: "WMict p3", x: 9, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.3", abbr: "WMict p3", x: 20, y: 22, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.4", abbr: "WMict p4", x: 19, y: 11, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.4", abbr: "WMict p4", x: 20, y: 15, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.5", abbr: "WMict p5", x: 5, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.5", abbr: "WMict p5", x: 7, y: 8, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.6", abbr: "WMict p6", x: 10, y: 15, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.6", abbr: "WMict p6", x: 29, y: 24, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.7", abbr: "WMict p7", x: 3, y: 24, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.7", abbr: "WMict p7", x: 29, y: 29, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.8", abbr: "WMict p8", x: 4, y: 26, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Wschodni Mictlan p.8", abbr: "WMict p8", x: 23, y: 8, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.2", abbr: "ZMict p2", x: 5, y: 15, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.3", abbr: "ZMict p3", x: 3, y: 11, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.3", abbr: "ZMict p3", x: 29, y: 18, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.4", abbr: "ZMict p4", x: 12, y: 18, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.4", abbr: "ZMict p4", x: 20, y: 21, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.5", abbr: "ZMict p5", x: 7, y: 11, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.5", abbr: "ZMict p5", x: 15, y: 9, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.6", abbr: "ZMict p6", x: 3, y: 22, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.6", abbr: "ZMict p6", x: 28, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.7", abbr: "ZMict p7", x: 4, y: 6, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.7", abbr: "ZMict p7", x: 28, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.8", abbr: "ZMict p8", x: 10, y: 15, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Zachodni Mictlan p.8", abbr: "ZMict p8", x: 24, y: 16, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.2", abbr: "Topan p2", x: 16, y: 18, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.3", abbr: "Topan p3", x: 11, y: 14, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.3", abbr: "Topan p3", x: 20, y: 14, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.4", abbr: "Topan p4", x: 7, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.4", abbr: "Topan p4", x: 13, y: 6, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.5", abbr: "Topan p5", x: 9, y: 12, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.5", abbr: "Topan p5", x: 14, y: 11, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.6", abbr: "Topan p6", x: 3, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.6", abbr: "Topan p6", x: 28, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.7", abbr: "Topan p7", x: 9, y: 11, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.7", abbr: "Topan p7", x: 23, y: 26, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.8", abbr: "Topan p8", x: 12, y: 8, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.9", abbr: "Topan p9", x: 3, y: 12, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.9", abbr: "Topan p9", x: 22, y: 12, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.10", abbr: "Topanp10", x: 6, y: 18, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.10", abbr: "Topanp10", x: 22, y: 28, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.11", abbr: "Topanp11", x: 2, y: 15, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.12", abbr: "Topanp12", x: 2, y: 9, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Topan p.12", abbr: "Topanp12", x: 6, y: 17, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Niecka Xiuh Atl", abbr: "NieckaXA", x: 18, y: 70, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Niecka Xiuh Atl", abbr: "NieckaXA", x: 25, y: 9, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Niecka Xiuh Atl", abbr: "NieckaXA", x: 38, y: 5, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Niecka Xiuh Atl", abbr: "NieckaXA", x: 39, y: 64, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.2 s.1", abbr: "OzT p2s1", x: 24, y: 50, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.2 s.1", abbr: "OzT p2s1", x: 25, y: 11, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.2 s.2", abbr: "OzT p2s2", x: 16, y: 25, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.2 s.2", abbr: "OzT p2s2", x: 32, y: 30, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.3 s.1", abbr: "OzT p3s1", x: 14, y: 20, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.3 s.1", abbr: "OzT p3s1", x: 49, y: 41, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Oztotl Tzacua p.4 s.2", abbr: "OzT p4s2", x: 12, y: 10, hero_name: "Tepeyollotl", hero_abbr: "Kot", hero_level: 260 },
        { map: "Pustynne Katakumby", abbr: "PKat", x: 13, y: 7, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Pustynne Katakumby - sala 1", abbr: "PKat s1", x: 7, y: 23, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Pustynne Katakumby - sala 1", abbr: "PKat s1", x: 10, y: 17, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Pustynne Katakumby - sala 2", abbr: "PKat s2", x: 8, y: 13, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Pustynne Katakumby - sala 2", abbr: "PKat s2", x: 11, y: 22, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 1", abbr: "KoBez s1", x: 19, y: 35, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 1", abbr: "KoBez s1", x: 23, y: 40, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 1", abbr: "KoBez s1", x: 49, y: 24, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 1", abbr: "KoBez s1", x: 52, y: 14, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 1", abbr: "KoBez s1", x: 71, y: 14, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 2", abbr: "KoBez s2", x: 11, y: 40, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 2", abbr: "KoBez s2", x: 50, y: 29, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 2", abbr: "KoBez s2", x: 69, y: 40, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Komnaty Bezdusznych - sala 2", abbr: "KoBez s2", x: 78, y: 25, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Gwałtownej Śmierci", abbr: "KatGwaŚm", x: 30, y: 31, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Gwałtownej Śmierci", abbr: "KatGwaŚm", x: 46, y: 34, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Korytarz Porzuconych Marzeń", abbr: "KorytPMa", x: 15, y: 13, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Korytarz Porzuconych Marzeń", abbr: "KorytPMa", x: 16, y: 15, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Opętanych Dusz", abbr: "KatODusz", x: 15, y: 40, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Opętanych Dusz", abbr: "KatODusz", x: 16, y: 20, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Odnalezionych Skrytobójców", abbr: "KatOdnSk", x: 7, y: 15, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Odnalezionych Skrytobójców", abbr: "KatOdnSk", x: 19, y: 20, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Korytarz Porzuconych Nadziei", abbr: "KorytPNa", x: 12, y: 11, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Wschodni Tunel Jaźni", abbr: "WTunJaźn", x: 18, y: 13, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Wschodni Tunel Jaźni", abbr: "WTunJaźn", x: 26, y: 48, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Wschodni Tunel Jaźni", abbr: "WTunJaźn", x: 61, y: 42, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Wschodni Tunel Jaźni", abbr: "WTunJaźn", x: 73, y: 20, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Krwawych Wypraw", abbr: "KatKrWyp", x: 29, y: 26, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Krwawych Wypraw", abbr: "KatKrWyp", x: 38, y: 13, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Zachodni Tunel Jaźni", abbr: "ZTunJaźn", x: 11, y: 16, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Zachodni Tunel Jaźni", abbr: "ZTunJaźn", x: 20, y: 37, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Zachodni Tunel Jaźni", abbr: "ZTunJaźn", x: 35, y: 8, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Zachodni Tunel Jaźni", abbr: "ZTunJaźn", x: 39, y: 45, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Zachodni Tunel Jaźni", abbr: "ZTunJaźn", x: 52, y: 10, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Poległych Legionistów", abbr: "KatPoLeg", x: 21, y: 33, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Katakumby Poległych Legionistów", abbr: "KatPoLeg", x: 23, y: 6, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Grobowiec Seta", abbr: "GrobSeta", x: 26, y: 38, hero_name: "Negthotep Czarny Kapłan", hero_abbr: "Neg", hero_level: 271 },
        { map: "Pustynia Shaiharrud - zachód", abbr: "PusShaiZ", x: 4, y: 19, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - zachód", abbr: "PusShaiZ", x: 26, y: 8, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - zachód", abbr: "PusShaiZ", x: 30, y: 90, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - zachód", abbr: "PusShaiZ", x: 52, y: 38, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - zachód", abbr: "PusShaiZ", x: 55, y: 6, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Sępiarnia", abbr: "Sępiarn", x: 7, y: 5, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Szczęk", abbr: "JaskSzcz", x: 23, y: 5, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Piaskowej Burzy s.1", abbr: "JasPB s1", x: 16, y: 8, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Piaskowej Burzy s.2", abbr: "JasPB s2", x: 5, y: 20, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - wschód", abbr: "PusShaiW", x: 5, y: 2, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - wschód", abbr: "PusShaiW", x: 21, y: 76, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - wschód", abbr: "PusShaiW", x: 24, y: 61, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - wschód", abbr: "PusShaiW", x: 47, y: 24, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Pustynia Shaiharrud - wschód", abbr: "PusShaiW", x: 55, y: 62, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jurta Nomadzka", abbr: "JurtaNom", x: 4, y: 7, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Odwagi", abbr: "JasOdwag", x: 27, y: 11, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Grota Poświęcenia", abbr: "GrotPośw", x: 4, y: 21, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Świątynia Hebrehotha - przedsionek", abbr: "ŚH przed", x: 26, y: 12, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Smocze Skalisko", abbr: "SmSkalis", x: 52, y: 50, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Smocze Skalisko", abbr: "SmSkalis", x: 67, y: 23, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Sępa s.1", abbr: "JSęp s1", x: 29, y: 11, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Sępa s.1", abbr: "JSęp s1", x: 29, y: 41, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Jaskinia Sępa s.2", abbr: "JSęp s2", x: 14, y: 19, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Urwisko Vapora", abbr: "UrwVapor", x: 20, y: 58, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Urwisko Vapora", abbr: "UrwVapor", x: 29, y: 46, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Urwisko Vapora", abbr: "UrwVapor", x: 64, y: 37, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Skały Umarłych", abbr: "SkałUmar", x: 30, y: 31, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Skały Umarłych", abbr: "SkałUmar", x: 31, y: 87, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Skały Umarłych", abbr: "SkałUmar", x: 54, y: 70, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 },
        { map: "Skały Umarłych", abbr: "SkałUmar", x: 60, y: 30, hero_name: "Młody Smok", hero_abbr: "Smok", hero_level: 282 }
    ];

    const heroButtonWidths = {
        "Smok": 38, "Neg": 31, "Kot": 27, "Dębo": 36, "Vap": 29,
        "Dem": 33, "Mul": 28, "Viv": 26, "Lich": 31, "Obł": 28,
        "Ata": 27, "Baca": 35, "Rog": 31, "Brat": 31, "Kas": 29,
        "Koch": 35, "Koz": 29, "Koś": 29, "Opek": 36, "Prze": 33,
        "Złod": 32, "Karm": 36, "Pat": 27, "Miet": 31, "Dom": 33
    };

    const getHeroList = () => {
        const unique = new Map();
        for (const r of RESPAWN_LIST) {
            if (!unique.has(r.hero_abbr)) {
                unique.set(r.hero_abbr, {
                    abbr: r.hero_abbr,
                    name: r.hero_name,
                    level: r.hero_level
                });
            }
        }
        return Array.from(unique.values());
    };

    const formatTime = (ms) => {
        const t = Math.floor((Date.now() - ms) / 1000);
        const h = String(Math.floor(t / 3600)).padStart(2, '0');
        const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
        const s = String(t % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const createHeroButtons = (container, moreBtn) => {
        console.log('[DEBUG] createHeroButtons start');
        console.log('[DEBUG] lastPlayerLevel =', lastPlayerLevel);


        container.querySelectorAll('button:not([title="Więcej herosów"]):not([data-move])').forEach(el => el.remove());

        const playerLevel = lastPlayerLevel;
        const hideMiet = GM_getValue('hideMiet', false);
        const allHeroes = getHeroList().filter(h => !(hideMiet && h.abbr === 'Miet'));

        const categorized = allHeroes.map(hero => {
            const isSpecial = RESPAWN_LIST.some(r =>
                r.hero_abbr === hero.abbr && r.x === -1 && r.y === -1
            );
            const visible = playerLevel !== null && isHeroVisibleToPlayer(hero.level, playerLevel, isSpecial);

            let group = 3;
            if (visible) {
                if (hero.level > playerLevel) {
                    group = 1;
                } else if (hero.level >= playerLevel - 13) {
                    group = 0;
                } else {
                    group = 2;
                }
            }

            return { ...hero, _group: group };
        });

        categorized.sort((a, b) => {
            if (a._group !== b._group) return a._group - b._group;
            if (a._group === 1) {
                return a.level - b.level; // rosnąco
            } else {
                return b.level - a.level; // malejąco
            }
        });

        const topBar = moreBtn.closest('div');
        const topBarWidth = topBar?.getBoundingClientRect().width ?? 420;
        const reserved = 18 + 6 + 18 + 4; // moveHandle + right margin + moreBtn + odstępy
        const maxAvailable = topBarWidth - reserved;

        let totalWidth = 0;
        let shown = [];

        for (const hero of categorized) {
            const btnWidth = heroButtonWidths[hero.abbr] ?? 38;
            if (shown.length > 0) totalWidth += 2;
            if (totalWidth + btnWidth > maxAvailable) break;
            totalWidth += btnWidth;
            shown.push(hero);
        }

        const shownAbbrSet = new Set(shown.map(h => h.abbr));

        for (let i = 0; i < shown.length; i++) {
            const hero = shown[i];
            const btnWidth = heroButtonWidths[hero.abbr] ?? 38;

            const btn = document.createElement('button');
            btn.textContent = hero.abbr;
            btn.title = `${hero.name} (lvl ${hero.level})`;
            btn.setAttribute('data-hero', hero.abbr);
            btn.style.cssText = `
                background: ${hero.abbr === activeHeroAbbr ? 'darkgreen' : 'gray'};
                color: white;
                border: none;
                padding: 2px 0;
                cursor: pointer;
                font-size: 10px;
                height: 18px;
                width: ${btnWidth}px;
                ${i < shown.length - 1 ? 'margin-right: 2px;' : ''}
            `;
            btn.addEventListener('click', () => {
                activeHeroAbbr = hero.abbr;
                GM_setValue('lastHeroAbbr', activeHeroAbbr);
                updateTable();
                createUI();
                updateDropdownHighlighting();
            });

        container.appendChild(btn);
    }

        moreBtn.style.background = shownAbbrSet.has(activeHeroAbbr) ? '#333' : 'darkgreen';
    };

    function showSettingsDialog() {
        if (document.getElementById('settings-dialog')) return;

        const overlay = document.createElement('div');
        overlay.id = 'settings-dialog';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const box = document.createElement('div');
        box.style.cssText = `
            background: #222;
            border: 1px solid #555;
            color: white;
            padding: 16px;
            min-width: 200px;
            font-size: 12px;
        `;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'hide-miet';
        checkbox.checked = GM_getValue('hideMiet', false);

        const label = document.createElement('label');
        label.htmlFor = 'hide-miet';
        label.textContent = ' Ukryj Mietka';

        checkbox.addEventListener('change', () => {
            GM_setValue('hideMiet', checkbox.checked);
            document.getElementById('settings-dialog')?.remove();
            createUI();
            updateTable();
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Zamknij';
        closeBtn.style.cssText = 'margin-top: 10px; float: right;';
        closeBtn.addEventListener('click', () => overlay.remove());

        box.appendChild(checkbox);
        box.appendChild(label);
        box.appendChild(document.createElement('br'));
        box.appendChild(closeBtn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    const showHeroDropdown = (anchorElement) => {
        document.getElementById('hero-dropdown')?.remove();

        const dropdown = document.createElement('div');
        dropdown.id = 'hero-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            background: #222;
            border: 1px solid #555;
            padding: 5px;
            z-index: 10001;
            max-height: 300px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 4px;
            top: ${anchorElement.getBoundingClientRect().bottom + 5}px;
            left: ${anchorElement.getBoundingClientRect().left}px;
        `;

        const controlBar = document.createElement('div');
        controlBar.style.cssText = `
            display: flex;
            justify-content: center; /* Wyśrodkowanie całej grupy przycisków */
            gap: 4px;
            margin-bottom: 4px;
        `;

        const makeIconBtn = (symbol, title, onClick) => {
            const btn = document.createElement('button');
            btn.textContent = symbol;
            btn.title = title;
            btn.style.cssText = `
                width: 18px;
                height: 18px;
                font-size: 13px;
                padding: 0;
                background: #444;
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center; /* Wyśrodkowanie symbolu w przycisku */
            `;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick();
            });
            return btn;
        };

        controlBar.appendChild(makeIconBtn('⚙', 'Ustawienia', () => {
            showSettingsDialog();
        }));

        controlBar.appendChild(makeIconBtn('▭', 'Małe okno (200x128)', () => {
            GM_setValue('ui_width', '200px');
            GM_setValue('ui_height', '128px');
            document.getElementById('resp-wrapper')?.remove();
            createUI();
            updateTable();
        }));

        controlBar.appendChild(makeIconBtn('▣', 'Duże okno (875x500)', () => {
            GM_setValue('ui_width', '875px');
            GM_setValue('ui_height', '500px');
            document.getElementById('resp-wrapper')?.remove();
            createUI();
            updateTable();
        }));

        dropdown.appendChild(controlBar); // ⬅ wstawienie paska kontrolnego na górę

        const playerLevel = lastPlayerLevel;
        const hideMiet = GM_getValue('hideMiet', false);
        const allHeroes = getHeroList()
            .filter(h => !(hideMiet && h.abbr === 'Miet'))
            .sort((a, b) => b.level - a.level);
        const visibleAbbrs = new Set();
            for (const hero of getHeroList()) {
                const isSpecial = RESPAWN_LIST.some(r => r.hero_abbr === hero.abbr && r.x === -1 && r.y === -1);
                if (isHeroVisibleToPlayer(hero.level, lastPlayerLevel, isSpecial)) {
                    visibleAbbrs.add(hero.abbr);
                }
            }

        for (const hero of allHeroes) {
            const btn = document.createElement('button');
            btn.textContent = `${hero.name} (${hero.level})`;
            btn.style.cssText = `
                background: ${hero.abbr === activeHeroAbbr ? 'darkgreen' :
                             visibleAbbrs.has(hero.abbr) ? 'gray' : '#444'};
                color: white;
                border: none;
                padding: 2px 6px;
                cursor: pointer;
                font-size: 10px;
            `;
            btn.addEventListener('click', () => {
                activeHeroAbbr = hero.abbr;
                GM_setValue('lastHeroAbbr', activeHeroAbbr);
                updateTable();
                createUI();
                updateDropdownHighlighting();
            });
            dropdown.appendChild(btn);
        }
        dropdown.addEventListener('wheel', (e) => {
            e.preventDefault();
            dropdown.scrollTop += Math.sign(e.deltaY) * 18 * 2;
        }, { passive: false });
        document.body.appendChild(dropdown);

        const onClickOutside = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', onClickOutside);
            }
        };
        setTimeout(() => document.addEventListener('click', onClickOutside), 0);
    };

    function updateDropdownHighlighting() {
        const dropdown = document.getElementById('hero-dropdown');
        if (!dropdown) return;

        const visibleAbbrs = new Set();
        for (const hero of getHeroList()) {
            const isSpecial = RESPAWN_LIST.some(r => r.hero_abbr === hero.abbr && r.x === -1 && r.y === -1);
            if (isHeroVisibleToPlayer(hero.level, lastPlayerLevel, isSpecial)) {
                visibleAbbrs.add(hero.abbr);
            }
        }

        dropdown.querySelectorAll('button').forEach(btn => {
            const txt = btn.textContent;
            const match = txt.match(/(.+?) \((\d+)\)/);
            if (!match) return;
            const name = match[1].trim();
            const level = parseInt(match[2]);
            const abbr = getHeroList().find(h => h.name === name && h.level === level)?.abbr;

            btn.style.background = abbr === activeHeroAbbr
                ? 'darkgreen'
                : visibleAbbrs.has(abbr) ? 'gray' : '#444';
        });
    }

    const updateTable = () => {
        const body = document.getElementById('resp-body');
        if (!body) return;

        const data = GM_getValue('respData', {});
        const container = document.getElementById('resp-wrapper');
        if (!container) return;

        const showShort = container.clientWidth < 360;
        const shortenName = container.clientWidth < 320;

        const rows = RESPAWN_LIST
            .filter(r => r.hero_abbr === activeHeroAbbr)
            .map(({ map, abbr, x, y }) => {
                const key = `${map}_${x}_${y}`;
                const entry = data[key] || {};
                return {
                    map: showShort ? abbr : map,
                    coords: (x === -1 && y === -1) ? 'nd.' : `(${x},${y})`,
                    name: shortenName && entry.name ? (entry.name.slice(0, 5) + '...') : (entry.name || ''),
                    time: entry.time || 0,
                    key
                };
            });
        const { column, asc } = currentSort;
        rows.sort((a, b) => {
            if (column === 'time') return asc ? a.time - b.time : b.time - a.time;
            const valA = (a[column] || '').toLowerCase();
            const valB = (b[column] || '').toLowerCase();
            return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });

        body.innerHTML = rows.map(row => `
            <tr>
                <td>${row.map}</td>
                <td>${row.coords}</td>
                <td>${row.name}</td>
                <td>${row.time ? formatTime(row.time) : '-'}</td>
            </tr>
        `).join('');
    };

    const isHeroVisibleToPlayer = (heroLevel, playerLevel, isSpecial = false) => {
        const lower = isSpecial
            ? Math.floor(heroLevel / 2)
            : (heroLevel <= 100 ? Math.floor(heroLevel / 2) : heroLevel - 50);
        const upper = isSpecial
            ? Infinity
            : (heroLevel < 250 ? heroLevel + 13 : Infinity);

        return playerLevel >= lower && playerLevel <= upper;
    };

    const runRespCheck = (map, x, y, name, playerLevel) => {
        const data = GM_getValue('respData', {});
        let updated = false;

        for (const { map: m, x: rx, y: ry, hero_abbr, hero_level } of RESPAWN_LIST) {
            if (m !== map) continue;

            const isSpecial = rx === -1 && ry === -1;
            if (!isHeroVisibleToPlayer(hero_level, playerLevel, isSpecial)) continue;

            const inRange = isSpecial || (Math.abs(x - rx) <= RESPAWN_RADIUS && Math.abs(y - ry) <= RESPAWN_RADIUS);
            if (!inRange) continue;

            const key = `${map}_${rx}_${ry}`;
            if (!data[key] || data[key].name !== name || Date.now() - data[key].time > 1000) {
                data[key] = { name, time: Date.now() };
                updated = true;

                const coordsDisplay = isSpecial ? 'nd.' : `(${rx},${ry})`;
                const hideMiet = GM_getValue('hideMiet', false);
                if (hideMiet && hero_abbr === 'Miet') return;
                const log = document.getElementById('resp-log');
                if (log) {
                    log.textContent = `Sprawdzono resp ${hero_abbr} na ${coordsDisplay}`;

                    // 🔸 Podświetlenie przycisku herosa lub przycisku 'więcej'
                const topBar = document.querySelector('#resp-wrapper > div');
                    if (topBar) {
                        const btn = topBar.querySelector(`button[data-hero="${hero_abbr}"]`);
                        const target = btn || topBar.querySelector('button[title="Więcej herosów"]');

                        if (target && !target.hasAttribute('data-highlighted')) {
                            target.setAttribute('data-original-bg', target.style.background);
                            target.setAttribute('data-highlighted', 'true');
                            target.style.background = 'gold';

                            setTimeout(() => {
                                target.style.background = target.getAttribute('data-original-bg');
                                target.removeAttribute('data-original-bg');
                                target.removeAttribute('data-highlighted');
                            }, 1000);
                        }
                    }
                }
            }
        }

        if (updated) GM_setValue('respData', data);
    };

    let lastCheckedMap = null;
    let lastPlayerLevel = null;
    let hasVisibleResps = false;

    const checkPosition = () => {
        const mapSpan = document.querySelector('span.location');
        if (!mapSpan) return;

        const currentMap = mapSpan.textContent.trim();
        if (currentMap !== lastCheckedMap) {
            lastCheckedMap = currentMap;

            const nameSpan = document.querySelector('span.heroname');
            if (!nameSpan) return;

            const levelMatch = nameSpan.textContent.match(/\((\d+)[a-z]*\)/);
            if (!levelMatch) return;

            lastPlayerLevel = parseInt(levelMatch[1]);

            hasVisibleResps = false;
            for (const r of RESPAWN_LIST) {
                if (r.map === currentMap && isHeroVisibleToPlayer(r.hero_level, lastPlayerLevel, r.x === -1 && r.y === -1)) {
                    hasVisibleResps = true;
                    break;
                }
            }
        }

        if (!hasVisibleResps) return;

        const coordsSpan = document.querySelector('span.coords');
        const nameSpan = document.querySelector('span.heroname');
        if (!coordsSpan || !nameSpan) return;

        const coords = coordsSpan.textContent.match(/\((\d+),\s*(\d+)\)/);
        if (!coords) return;
        const x = parseInt(coords[1]);
        const y = parseInt(coords[2]);

        const name = nameSpan.textContent.split('(')[0].trim();
        const newCoords = `${currentMap}_${x}_${y}`;
        const now = Date.now();

        if (lastCoords !== newCoords) {
            lastCoords = newCoords;
            lastStaticCheck = now;
            runRespCheck(currentMap, x, y, name, lastPlayerLevel);
        } else if (now - lastStaticCheck >= 1000) {
            lastStaticCheck = now;
            runRespCheck(currentMap, x, y, name, lastPlayerLevel);
        }
    };

    const checkIfReady = () => {
        let attempts = 0;
        const maxAttempts = 600; // do 30 sekund
        const interval = 50;

        const intervalId = setInterval(() => {
            const span = document.querySelector('span.heroname');
            const content = span?.textContent?.trim() ?? '';
            const match = content.match(/\((\d+)[a-z]*\)/);

            console.log(`[DEBUG] Próba ${attempts + 1}: zawartość span.heroname = "${content}"`);

            if (match) {
                lastPlayerLevel = parseInt(match[1]);
                clearInterval(intervalId);
                console.log(`[DEBUG] Gra gotowa — inicjalizacja. Poziom gracza: ${lastPlayerLevel}`);
                checkPosition();
                createUI();
                updateTable();
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                    console.warn('[DEBUG] Nie udało się wykryć gotowości gry w ciągu 30 sekund.');
                }
            }
        }, interval);
    };

    const createUI = () => {
        console.log('[DEBUG] createUI wywołane');
        document.getElementById('resp-wrapper')?.remove();

        const wrapper = document.createElement('div');
        wrapper.id = 'resp-wrapper';
        wrapper.style.cssText = `
            position: fixed;
            background: black;
            color: white;
            border: 2px solid black;
            z-index: 9999;
            font-family: sans-serif;
            font-size: 10px;
            resize: both;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        const savedLeft = GM_getValue('ui_left');
        const savedTop = GM_getValue('ui_top');
        const savedWidth = GM_getValue('ui_width');
        const savedHeight = GM_getValue('ui_height');
        const savedVisible = GM_getValue('ui_visible', true);

        wrapper.style.left = savedLeft ?? 'auto';
        wrapper.style.top = savedTop ?? '100px';
        wrapper.style.right = savedLeft ? 'auto' : '20px';
        wrapper.style.width = savedWidth ?? '420px';
        wrapper.style.height = savedHeight ?? '500px';
        wrapper.style.display = savedVisible ? 'flex' : 'none';

        // Górna belka
        const topBar = document.createElement('div');
        topBar.style.cssText = `
            display: flex;
            align-items: center;
            padding: 4px;
            background: #222;
            width: 100%;
            gap: 4px;
        `;

        // Uchwyt do przesuwania
        const moveHandle = document.createElement('div');
        moveHandle.textContent = '✥';
        moveHandle.title = 'Przeciągnij, by przesunąć okno';
        moveHandle.setAttribute('data-move', '1');
        moveHandle.style.cssText = `
            cursor: move;
            background: #444;
            font-size: 12px;
            height: 18px;
            width: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            order: 0;
        `;
        let offsetX = 0, offsetY = 0, isDragging = false;

        moveHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            const rect = wrapper.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            wrapper.style.left = `${e.clientX - offsetX}px`;
            wrapper.style.top = `${e.clientY - offsetY}px`;
            wrapper.style.right = 'auto'; // ← zapobiega nadpisaniu przez CSS
            GM_setValue('ui_left', wrapper.style.left);
            GM_setValue('ui_top', wrapper.style.top);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Kontener na przyciski herosów (wyśrodkowany flexbox)
        const heroBtnWrapper = document.createElement('div');
        heroBtnWrapper.style.cssText = `
            display: flex;
            justify-content: center;
            flex-grow: 1;
            overflow: hidden;
        `;

        // Właściwy kontener przycisków herosów
        const heroBtnContainer = document.createElement('div');
        heroBtnContainer.style.cssText = `
            display: flex;
            flex-wrap: nowrap;
            gap: 2px;
            overflow: hidden;
            align-items: center;
        `;

        // Przycisk Więcej herosów
        const moreBtn = document.createElement('button');
        moreBtn.textContent = '⋯';
        moreBtn.title = 'Więcej herosów';
        moreBtn.style.cssText = `
            background: gray;
            color: white;
            border: none;
            padding: 0;
            font-size: 12px;
            height: 18px;
            width: 18px;
            flex-shrink: 0;
            margin-right: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const existing = document.getElementById('hero-dropdown');
            if (existing) {
                existing.remove();
            } else {
                showHeroDropdown(moreBtn);
            }
        });

        // Składanie topBar
        heroBtnWrapper.appendChild(heroBtnContainer);
        topBar.appendChild(moveHandle);
        topBar.appendChild(heroBtnWrapper);
        topBar.appendChild(moreBtn);
        wrapper.appendChild(topBar);

        // Inicjalizacja przycisków
        createHeroButtons(heroBtnContainer, moreBtn);

        // Reszta UI (bez zmian)
        const tableWrapper = document.createElement('div');
        tableWrapper.style.cssText = 'overflow-y: auto; flex-grow: 1;';
        tableWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            tableWrapper.scrollTop += Math.sign(e.deltaY) * 18 * 2;
        }, { passive: false });

        const table = document.createElement('table');
        table.style.width = '100%';

        const thead = document.createElement('thead');
        thead.style.cssText = 'position: sticky; top: 0; background: black; z-index: 10;';
        const headerRow = document.createElement('tr');

        const createHeaderCell = (label, column) => {
            const th = document.createElement('th');
            th.style.cursor = 'pointer';
            th.innerHTML = `${label} ▲▼`;
            th.addEventListener('click', () => {
                if (currentSort.column === column) {
                    currentSort.asc = !currentSort.asc;
                } else {
                    currentSort.column = column;
                    currentSort.asc = true;
                }
                GM_setValue('sort', currentSort);
                updateTable();
            });
            return th;
        };

        headerRow.appendChild(createHeaderCell('Mapa', 'map'));
        headerRow.appendChild(document.createElement('th')).textContent = 'Resp';
        headerRow.appendChild(createHeaderCell('Gracz', 'name'));
        headerRow.appendChild(createHeaderCell('Czas', 'time'));
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.id = 'resp-body';
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        wrapper.appendChild(tableWrapper);

        const log = document.createElement('div');
        log.id = 'resp-log';
        log.style.cssText = 'padding: 5px; font-size: 10px; background: black; color: white; min-height: 20px;';
        wrapper.appendChild(log);

        document.body.appendChild(wrapper);

        const toggleBtn = document.getElementById('resp-toggle-btn');
        if (!toggleBtn) {
            const btn = document.createElement('button');
            btn.id = 'resp-toggle-btn';
            btn.textContent = 'ŁH';
            btn.title = 'Pokaż/ukryj okienko Resp Tracker';
            btn.style.cssText = `
                position: fixed;
                width: 25px;
                height: 25px;
                background: black;
                color: white;
                border: 2px solid white;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                z-index: 10000;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            btn.style.left = GM_getValue('toggle_left', '10px');
            btn.style.top = GM_getValue('toggle_top', '10px');

            btn.addEventListener('click', () => {
                if (dragged) return;
                const el = document.getElementById('resp-wrapper');
                const visible = el.style.display === 'none';
                el.style.display = visible ? 'flex' : 'none';
                GM_setValue('ui_visible', visible);
            });

            let drag = false, dragged = false, offsetX = 0, offsetY = 0;
            btn.addEventListener('mousedown', e => {
                drag = true;
                dragged = false
                offsetX = e.offsetX;
                offsetY = e.offsetY;
            });
            document.addEventListener('mousemove', e => {
                if (drag) {
                    dragged = true;
                    btn.style.left = `${e.clientX - offsetX}px`;
                    btn.style.top = `${e.clientY - offsetY}px`;
                    GM_setValue('toggle_left', btn.style.left);
                    GM_setValue('toggle_top', btn.style.top);
                }
            });
            document.addEventListener('mouseup', () => drag = false);

            document.body.appendChild(btn);
        }

        new ResizeObserver(() => {
            GM_setValue('ui_width', wrapper.style.width);
            GM_setValue('ui_height', wrapper.style.height);
            const topBar = document.querySelector('#resp-wrapper > div');
            const moreBtn = topBar?.querySelector('button[title="Więcej herosów"]');
            if (topBar && moreBtn) {
                createHeroButtons(topBar.querySelector('div:not([data-move])'), moreBtn);
            }
        }).observe(wrapper);
    };

    const nameSpan = document.querySelector('span.heroname');
    const levelMatch = nameSpan?.textContent.match(/\((\d+)[a-z]*\)/);
    if (levelMatch) {
        lastPlayerLevel = parseInt(levelMatch[1]);
    }

    // domyślny aktywny heros — jeśli nie ustawiony
    if (!activeHeroAbbr) {
        const firstHero = getHeroList()
            .filter(h => isHeroVisibleToPlayer(h.level, lastPlayerLevel ?? 0))
            .sort((a, b) => {
                const aGroup = (a.level >= 50 && a.level <= lastPlayerLevel) ? 0 : 1;
                const bGroup = (b.level >= 50 && b.level <= lastPlayerLevel) ? 0 : 1;
                return aGroup - bGroup || b.level - a.level;
            })[0];
        if (firstHero) activeHeroAbbr = firstHero.abbr;
    }

    console.log('[DEBUG] Inicjalizacja: createUI + updateTable');
    checkIfReady();
    setInterval(checkPosition, 200);
    setInterval(updateTable, 1000);
})();
