  module.exports = {
        /**
         * 神秘商店购买礼包
         * @args {activityId:"活动id",index:"栏目项"}
         * @isWorker 1
         * @returns [ds.ExActivity]
         */
        a_activity_getList: "a.ac.e",
        a_activity_receive: "a.ac.f",
        a_activity_receive_args: {
            activityId: "_0",
            index: "_1"
        },
        a_activity_patchSign: "a.ac.i",
        a_activity_patchSign_args: {
            activityId: "_0"
        },
        a_activity_refreshDayShop: "a.ac.k",
        a_activity_refreshDayShop_args: {
            activityId: "_0",
            type: "_1"
        },
        a_activity_getLotteryInfo: "a.ac.l",
        a_activity_getLotteryInfo_args: {
            activityId: "_0"
        },
        a_activity_getLotteryChest: "a.ac.m",
        a_activity_getLotteryChest_args: {
            activityId: "_0",
            index: "_1"
        },
        a_achieve_levelUp: "a.am.a",
        a_achieve_cybLevelUp: "a.am.b",
        a_achieve_jxLevelUp: "a.am.c",
        a_arena_getInfo: "a.ar.a",
        a_arena_resetFightRanks: "a.ar.d",
        a_arena_fightStart: "a.ar.h1",
        a_arena_fightStart_args: {
            rank: "_0"
        },
        a_arena_fightEnd: "a.ar.h2",
        a_arena_fightEnd_args: {
            rank: "_0",
            isWin: "_1",
            fightData: "_2"
        },
        a_arena_getFightUserList: "a.ar.l",
        a_arena_buyPKNum: "a.ar.m",
        a_arena_getRecordList: "a.ar.n",
        a_arena_getRecordList_args: {
            index: "_0",
            count: "_1"
        },
        a_arena_setRead: "a.ar.o",
        a_arena_pickRankAward: "a.ar.p",
        a_arena_refreshCD: "a.ar.q",
        a_arena_getRankList: "a.ar.r",
        a_arena_getRefreshRemainTime: "a.ar.rt",
        a_csBoss_getCSBossServer: "a.b.a",
        a_bonus_getInfo: "a.bs.a",
        a_bonus_getInfo_args: {
            lastId: "_0"
        },
        a_bonus_breakRelation: "a.bs.b",
        a_bonus_breakRelation_args: {
            inviteeUserId: "_0"
        },
        a_bonus_share: "a.bs.c",
        a_bonus_share_args: {
            serverIndexId: "_0"
        },
        a_bonus_draw: "a.bs.d",
        a_bonus_sendShareGift: "a.bs.e",
        a_boss_getGuildBossList: "a.bo.a",
        a_boss_getWorldBossList: "a.bo.a1",
        a_boss_getTeamBossList: "a.bo.a2",
        a_boss_openBoss: "a.bo.b1",
        a_boss_openBoss_args: {
            bossId: "_0",
            isLock: "_1"
        },
        a_boss_enter: "a.bo.b",
        a_boss_enter_args: {
            bossId: "_0"
        },
        a_boss_startFight: "a.bo.c",
        a_boss_startFight_args: {
            bossId: "_0"
        },
        a_boss_canEnter: "a.bo.c1",
        a_boss_canEnter_args: {
            bossId: "_0"
        },
        a_boss_hurt: "a.bo.d",
        a_boss_hurt_args: {
            bossId: "_0",
            hurtDic: "_1",
            isEnd: "_2",
            mData: "_3",
            hurtArr: "_4"
        },
        a_boss_exitFight: "a.bo.e",
        a_boss_exitFight_args: {
            bossId: "_0"
        },
        a_boss_clearFightCd: "a.bo.e1",
        a_boss_inspire: "a.bo.f",
        a_boss_inspire_args: {
            bossId: "_0"
        },
        a_boss_getInspireRecordArr: "a.bo.g",
        a_boss_getInspireRecordArr_args: {
            bossId: "_0"
        },
        a_boss_syncInspire: "a.bo.h",
        a_boss_syncInspire_args: {
            bossId: "_0"
        },
        a_boss_getHurtRankList: "a.bo.i",
        a_boss_getHurtRankList_args: {
            bossId: "_0"
        },
        a_boss_getFirstHurtRank: "a.bo.i1",
        a_boss_getFirstHurtRank_args: {
            bossId: "_0"
        },
        a_boss_getBossResult: "a.bo.j",
        a_boss_getBossResult_args: {
            bossId: "_0",
            originBossId: "_1"
        },
        a_boss_getResultData: "a.bo.j1",
        a_boss_getResultData_args: {
            originBossId: "_0"
        },
        a_boss_getBossRecord: "a.bo.k",
        a_boss_getBossRecord_args: {
            type: "_0",
            id: "_1"
        },
        a_boss_getVariousOpenDate: "a.bo.m", //获得各类系统开启时间
        a_boss_getWBHurtAward: "a.bo.n",
        a_boss_getWBHurtAward_args: {
            idx: "_0"
        },
        a_boss_getWBResult: "a.bo.o",
        a_demonLotus_getInfo: "a.de.a",
        a_demonLotus_upLotus: "a.de.b",
        a_demonLotus_getRevenue: "a.de.c",
        a_demonLotus_opening: "a.de.d",
        a_demonLotus_lotusAdvance: "a.de.e",
        a_demonLotus_treasureTrain: "a.de.f",
        a_mail_getList: "a.em.a",
        a_mail_pickItems: "a.em.b",
        a_mail_pickItems_args: {
            mailId: "_0"
        },
        a_mail_pickAllItems: "a.em.d",
        a_mail_setRead: "a.em.c",
        a_mail_setRead_args: {
            mailId: "_0"
        },
        a_mail_getIsNeedOperate: "a.em.e",
        a_mail_getIsNeedOperate_args: {
            mailId: "_0"
        },
        a_event_eventBuy: "a.ev.a",
        a_event_eventBuy_args: {
            eventId: "_0"
        },
        a_equip_changeEquip: "a.eq.a",
        a_equip_changeEquip_args: {
            tempId: "_0",
            index: "_1",
            equipId: "_2"
        },
        a_equip_inheritedEquip: "a.eq.b",
        a_equip_inheritedEquip_args: {
            equipId: "_0",
            tempId: "_1"
        },
        a_equip_customization: "a.eq.c",
        a_equip_customization_args: {
            certificate: "_0",
            job: "_1",
            name: "_2",
            lvl: "_3",
            abilityIndex: "_4",
            equipType: "_5"
        },
        a_equip_upCustomization: "a.eq.d",
        a_equip_upCustomization_args: {
            equipId: "_0"
        },
        a_equip_updateEquipItemLockStatus: "a.eq.e",
        a_equip_updateEquipItemLockStatus_args: {
            equipId: "_0",
            isLocked: "_1"
        },
        a_equip_sellEquipItems: "a.eq.f",
        a_equip_sellEquipItems_args: {
            equipIdArr: "_0"
        },
        a_equip_compoundEquip: "a.eq.i",
        a_equip_compoundEquip_args: {
            itemId: "_0",
            tempId: "_1",
            part: "_2"
        },
        a_equip_decompoundEquip: "a.eq.j",
        a_equip_decompoundEquip_args: {
            equipId: "_0"
        },
        a_equip_compoundHolyEquip: "a.eq.k",
        a_equip_compoundHolyEquip_args: {
            tempId: "_0",
            part: "_1"
        },
        a_equip_holyEquipLevelUp: "a.eq.l",
        a_equip_holyEquipLevelUp_args: {
            tempId: "_0",
            part: "_1"
        },
        a_equip_decompoundHolyEquip: "a.eq.m",
        a_equip_decompoundHolyEquip_args: {
            equipId: "_0"
        },
        //天使恶魔装备升级/升星
        a_equip_angelDemonEquipLevelUp: "a.eq.n",
        a_equip_angelDemonEquipLevelUp_args: {
            tempId: "_0", //英雄id
            part: "_1", //装备位置
            haveInitEquipIds: "_2" //拥有的初始小天使小恶魔装备背包ID数组
        },
        //分解天使恶魔装备
        a_equip_decompoundAngelDemonEquip: "a.eq.o",
        a_equip_decompoundAngelDemonEquip_args: {
            equipId: "_0" //装备id
        },
        a_user_getInfo: "a.u.a",
        a_user_changeName: "a.u.b",
        a_user_changeName_args: {
            name: "_0"
        },
        a_user_upLvl: "a.u.c",
        a_user_syncData: "a.u.f",
        a_user_syncData_args: {
            sendData: "_0"
        },
        a_user_syncData2: "a.u.f1",
        a_user_beat: "a.u.f2",
        a_user_getBagChest: "a.u.g",
        a_user_getBagChest_args: {
            chestId: "_0",
            count: "_1"
        },
        a_user_buyGold: "a.u.d",
        a_user_buyLingyun: "a.u.d1",
        a_user_getRedPoint: "a.u.h",
        a_user_updateGuide: "a.u.i",
        a_user_updateGuide_args: {
            guideId: "_0"
        },
        a_user_updateGuideExt: "a.u.i1",
        a_user_updateGuideExt_args: {
            k: "_0",
            v: "_1"
        },
        a_user_getWinRecord: "a.u.j",
        a_user_getLoseRecord: "a.u.k",
        a_user_saveDeskSuccess: "a.u.o",
        a_user_saveDeskSuccess_args: {
            type: "_0"
        },
        a_user_setHeroEmbattle: "a.u.p",
        a_user_setHeroEmbattle_args: {
            heroEmbattle: "_0"
        },
        a_user_buyBagGrid: "a.u.q",
        a_user_updateCombat: "a.u.q1",
        a_user_setAutoFight: "a.u.q2",
        a_user_setAutoFight_args: {
            isAuto: "_0"
        },
        a_user_setTimeError: "a.u.q3",
        a_user_setTimeError_args: {
            errorNum: "_0"
        },
        a_user_setTodayRankWin: "a.u.q4",
        a_user_setTodayRankWin_args: {
            eid: "_0"
        },
        a_user_getWarPrintedList: "a.u.q5",
        a_user_warPrintedStrength: "a.u.q6",
        a_user_warPrintedStrength_args: {
            warPrintedId: "_0"
        },
        a_user_setMedalTitle: "a.u.q7",
        a_user_setMedalTitle_args: {
            warPrintedId: "_0"
        },
        a_user_getGenuineQi: "a.u.q8",
        a_user_activeMedal: "a.u.q9",
        a_user_activeMedal_args: {
            warPrintedId: "_0"
        },
        a_user_updateTap: "a.u.q10",
        a_user_updateTap_args: {
            num: "_0"
        },
        a_user_updatePopUp: "a.u.q11",
        a_user_updatePopUp_args: {
            popUp: "_0"
        },
        a_user_setIcon: "a.u.q12",
        a_user_setIcon_args: {
            id: "_0"
        },
        a_user_setAwyVerify: "a.u.q13",
        a_user_getAwyVerifyReward: "a.u.q14",
        a_user_awyShare: "a.u.q15",
        a_user_getAwyShareReward: "a.u.q16",
        a_user_getAwyShareReward_args: {
            idx: "_0"
        },
        a_user_getInviteInfo: "a.u.q17",
        a_user_getInviteReward: "a.u.q18",
        a_user_getInviteReward_args: {
            idx: "_0"
        },
        a_user_getInviteRewardRecord: "a.u.q19",
        a_user_setFocus: "a.u.q20",
        a_user_setFocus_args: {
            ret: "_0"
        },
        a_user_getBindPhoneUrl: "a.u.r",
        a_user_getWanbagift: "a.u.s",
        a_user_getWanbagift_args: {
            os: "_0",
            giftId: "_1"
        },
        a_user_updateSetting: "a.u.t",
        a_user_updateSetting_args: {
            catNoVipChat: "_0",
            autoBuyLittleHorn: "_1",
            hideChatSys: "_2",
            hideChatWorld: "_3",
            hideChatGuild: "_4",
            hideDanmu: "_5"
        },
        a_user_updateItems4Bag: "a.u.u",
        a_user_updateItems4Bag_args: {
            itemId: "_0"
        },
        a_user_syncUserInfo: "a.u.u2",
        a_user_buyTeamBossNum: "a.u.v",
        a_user_followTeamBoss: "a.u.v1",
        a_user_followTeamBoss_args: {
            id: "_0"
        },
        a_user_unfollowTeamBoss: "a.u.v2",
        a_user_unfollowTeamBoss_args: {
            id: "_0"
        },
        a_user_followZhongLiBoss: "a.u.v3",
        a_user_followZhongLiBoss_args: {
            id: "_0"
        },
        a_user_unfollowZhongLiBoss: "a.u.v4",
        a_user_unfollowZhongLiBoss_args: {
            id: "_0"
        },
        a_user_getFakeWSUserList: "a.u.x",
        a_user_relive: "a.u.y",
        a_user_relive_args: {
            type: "_0"
        },
        a_user_upgradeCup: "a.u.c",
        a_user_useCapsule: "a.u.c1",
        a_user_useCapsule_args: {
            capsuleId: "_0"
        },
        a_user_receiveHeroEntranceTask: "a.u.c2",
        a_user_receiveHeroEntranceTask_args: {
            taskId: "_0" //任务id
        },
        a_user_getExData: "a.u.c3",
        a_user_buyMonthlyOrWeekCard: "a.u.c4",
        a_user_buyMonthlyOrWeekCard_args: {
            cardId: "_0" //卡id，21为周卡，22为月卡
        },
        a_user_activeNoble: "a.u.z", //激活贵族
        a_user_nobleReceive: "a.u.z1", //贵族奖励领取
        a_user_nobleReceive_args: {
            type: "_0", //0为日常, 1为VIP购买
            nobleLevel: "_1" //要领取的贵族等级
        },
        a_friend_getInfo: "a.f.a",
        a_friend_requestFriend: "a.f.b",
        a_friend_requestFriend_args: {
            requestedId: "_0"
        },
        a_friend_disposeFriendRequest: "a.f.c",
        a_friend_disposeFriendRequest_args: {
            requestId: "_0",
            isTake: "_1"
        },
        a_friend_eventCheer: "a.f.d",
        a_friend_getRequestInfo: "a.f.e",
        a_fight_pickLoot: "a.fi.a",
        a_fight_pickLoot_args: {
            copyId: "_0",
            uidArr: "_1",
            fightData: "_2"
        },
        a_fight_revive: "a.fi.b",
        a_fight_getAndInitNextLoot: "a.fi.c",
        a_fight_getAndInitNextLoot_args: {
            copyId: "_0",
            isBoss: "_1",
            lvl: "_2"
        },
        a_fiveDaysTarget_getInfo: "a.ft.e",
        a_fiveDaysTarget_getInfo1: "a.ft.a",
        a_fiveDaysTarget_getInfo2: "a.ft.b",
        a_guild_getInfo: "a.g.a",
        a_guild_establishGuild: "a.g.b",
        a_guild_establishGuild_args: {
            name: "_0"
        },
        a_guild_seekGuild: "a.g.c",
        a_guild_seekGuild_args: {
            guildId: "_0"
        },
        a_guild_joinGuild: "a.g.d",
        a_guild_joinGuild_args: {
            guildId: "_0"
        },
        a_guild_getAppliedMembers: "a.g.e",
        a_guild_appliedMembersSet: "a.g.f",
        a_guild_appliedMembersSet_args: {
            tUserId: "_0",
            isConsent: "_1"
        },
        a_guild_guildSetting: "a.g.g",
        a_guild_guildSetting_args: {
            joinCon: "_0",
            joinLvl: "_1"
        },
        a_guild_exitGuild: "a.g.h",
        a_guild_setNotice: "a.g.i",
        a_guild_setNotice_args: {
            notice: "_0"
        },
        a_guild_lottery: "a.g.j",
        a_guild_lottery_args: {
            count: "_0"
        },
        a_guild_setEnnoble: "a.g.k",
        a_guild_setEnnoble_args: {
            targetUserId: "_0",
            ennobleType: "_1"
        },
        a_guild_getGitfBoxList: "a.g.l",
        a_guild_getGitfBox: "a.g.m",
        a_guild_getGitfBox_args: {
            id: "_0"
        },
        a_guild_getWareHouse: "a.g.n", //请求公会仓库
        a_guild_dealWareHouse: "a.g.o", //请求分配仓库物品
        a_guild_dealWareHouse_args: {
            idx: "_0", //物品下标
            targetUserId: "_1", //目标玩家ID
            targetUserName: "_2" //目标玩家名
        },
        a_guild_getScoreRankListByType: "a.g.p", //公会战上届排行
        a_guild_getScoreRankListByType_args: {
            type: "_0" //排行类型
        },
        a_guild_explore: "a.g.q", //行会战每日探索 抽奖
        a_guild_explore_args: {
            index: "_0" //索引号
        },
        a_guild_refreshExplore: "a.g.r", //行会战每日探索生成奖库
        a_guildPerson_pickAct: "a.gp.a",
        a_guildPerson_pickAct_args: {
            actId: "_0"
        },
        a_guildPerson_getMemberList: "a.gp.b",
        a_guildPerson_opMember: "a.gp.c",
        a_guildPerson_opMember_args: {
            targetUserId: "_0",
            op: "_1"
        },
        a_guildPerson_getGTVitalityChest: "a.gp.d",
        a_guildPerson_getGTVitalityChest_args: {
            index: "_0"
        },
        a_guildPerson_getGWVitalityChest: "a.gp.e",
        a_guildPerson_getGWVitalityChest_args: {
            index: "_0"
        },
        a_guildPerson_getGift: "a.gp.f",
        a_guildPerson_getGift_args: {
            id: "_0"
        },
        a_guildPerson_getFuliChest: "a.gp.g",
        a_guildPerson_getFuliChest_args: {
            index: "_0"
        },
        // a_guildWar_getInfo: "a.gw.a",
        // a_guildWar_getGuildList: "a.gw.a1",
        // a_guildWar_getGuildList_args: {
        //     guildId: "_0"
        // },
        // a_guildWar_getWarAttackData: "a.gw.b",
        // a_guildWar_getWarAttackData_args: {
        //     serverId: "_0",
        //     guildId: "_1"
        // },
        // a_guildWar_getWarDefenceData: "a.gw.c",
        // a_guildWar_getWarDefenceData_args: {
        //     guildId: "_0"
        // },
        // a_guildWar_getDefenceRecordList: "a.gw.d",
        // a_guildWar_getAttackRecordList: "a.gw.e",
        // a_guildWar_getGuildWarAllRank: "a.gw.f",
        // a_guildWar_getLastRankList: "a.gw.f1",
        // a_guildWar_getLastRankList_args: {
        //     groupId: "_0"
        // },
        // a_guildWar_getSignUpData: "a.gw.g",
        // a_guildWar_getSignUpData_args: {
        //     guildId: "_0"
        // },
        // a_guildWar_signUp: "a.gw.g1",
        // a_guildWar_signUp_args: {
        //     groupId: "_0"
        // },
        // a_guildWar_fightStartDoor: "a.gw.h",
        // a_guildWar_fightStartDoor_args: {
        //     serverId: "_0",
        //     guildId: "_1",
        //     door: "_2"
        // },
        // a_guildWar_fightEndDoor: "a.gw.h1",
        // a_guildWar_fightEndDoor_args: {
        //     serverId: "_0",
        //     guildId: "_1",
        //     door: "_2",
        //     isWin: "_3"
        // },
        // a_guildWar_upDoor: "a.gw.i",
        // a_guildWar_upDoor_args: {
        //     door: "_0"
        // },
        // a_guildWar_downDoor: "a.gw.i1",
        // a_guildWar_downDoor_args: {
        //     door: "_0"
        // },
        // a_guildWar_enter: "a.gw.j",
        // a_guildWar_clearCd: "a.gw.j1",
        // a_guildWar_inspire: "a.gw.j2",
        // a_guildWar_syncData: "a.gw.k",
        // a_guildWar_syncData_args: {
        //     sceneType: "_0",
        //     attackData: "_1"
        // },
        a_honor_getInfo: "a.h.a",
        a_honor_getAward: "a.h.b",
        a_honor_getAward_args: {
            honorId: "_0"
        },
        a_honor_bugAlter: "a.h.c",
        a_heartStunt_getInfo: "a.hs.a",
        a_heartStunt_choMenCulMethods: "a.hs.b",
        a_heartStunt_choMenCulMethods_args: {
            index: "_0",
            heartStuntId: "_1"
        },
        a_heartStunt_stuMenCulMethods: "a.hs.c",
        a_heartStunt_stuMenCulMethods_args: {
            index: "_0"
        },
        a_heartStunt_chaMenCulMethods: "a.hs.d",
        a_heartStunt_chaMenCulMethods_args: {
            index: "_0",
            heartStuntId: "_1"
        },

        /**
         * 激活星盘(初始化数据)
         * @args {index:"契约槽位下标"}
         */
        a_heartStunt_activateStarPlate: "a.hs.e",
        a_heartStunt_activateStarPlate_args: {
            index: "_0" //契约槽位下标
        },
        /**
         * 解锁星盘槽位
         * @args {index:"契约槽位下标",slotIndex:"星盘位置下标"}
         */
        a_heartStunt_openSlot: "a.hs.f",
        a_heartStunt_openSlot_args: {
            index: "_0" //契约槽位下标
                ,
            slotIndex: "_1" //星盘位置下标
        },
        /**
         * 穿戴星魂
         * @args {index:"契约槽位下标",slotIndex:"星盘位置下标",starSoulId:"要穿的星魂ID"}
         */
        a_heartStunt_wearStarSoul: "a.hs.g",
        a_heartStunt_wearStarSoul_args: {
            index: "_0" //契约槽位下标
                ,
            slotIndex: "_1" //星盘位置下标
                ,
            starSoulId: "_2" //要穿的星魂ID
        },
        /**
         * 脱下星魂
         * @args {index:"契约槽位下标",slotIndex:"星盘位置下标"}
         */
        a_heartStunt_takeOffStarSoul: "a.hs.h",
        a_heartStunt_takeOffStarSoul_args: {
            index: "_0" //契约槽位下标
                ,
            slotIndex: "_1" //星盘位置下标
        },
        /**
         * 升级星魂
         * @args {starSoulId:"要升到的星魂ID"}
         */
        a_heartStunt_levelUpStarSoul: "a.hs.i",
        a_heartStunt_levelUpStarSoul_args: {
            starSoulId: "_0" //要升到的星魂ID
        },

        a_hero_callHero: "a.he.a",
        a_hero_callHero_args: {
            tempId: "_0",
            sex: "_1"
        },
        a_hero_upSkill: "a.he.b",
        a_hero_upSkill_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_upSkill2: "a.he.b2",
        a_hero_upSkill2_args: {
            tempId: "_0",
            skill: "_1"
        },
        a_hero_clearSkillCd: "a.he.c",
        a_hero_wearRune: "a.he.d",
        a_hero_wearRune_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_upRealm: "a.he.e",
        a_hero_upRealm_args: {
            tempId: "_0"
        },
        a_hero_strength: "a.he.f",
        a_hero_strength_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_equipRefine: "a.he.f1",
        a_hero_equipRefine_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_strength2: "a.he.f2",
        a_hero_strength2_args: {
            tempId: "_0",
            equip: "_1"
        },
        a_hero_upStar: "a.he.g",
        a_hero_upStar_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_starTop: "a.he.g1",
        a_hero_starTop_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_upGem: "a.he.h",
        a_hero_upGem_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_wingFos: "a.he.z",
        a_hero_wingFos_args: {
            tempId: "_0",
            fosType: "_1"
        },
        a_hero_wingStrength: "a.he.z1",
        a_hero_wingStrength_args: {
            tempId: "_0",
            part: "_1",
            isReplace: "_2"
        },
        a_hero_wingFos2Top: "a.he.z2",
        a_hero_wingFos2Top_args: {
            tempId: "_0",
            fosType: "_1",
            isUseDiamond: "_2"
        },
        a_hero_upWing: "a.he.k",
        a_hero_upWing_args: {
            tempId: "_0"
        },
        a_hero_wingActivate: "a.he.l",
        a_hero_wingActivate_args: {
            tempId: "_0"
        },
        a_hero_calPropAndCombat: "a.he.m",
        a_hero_getMainHeroDisplay: "a.he.n",
        a_hero_getMainHeroDisplay_args: {
            userId: "_0"
        },
        a_hero_getHeroDisplayByTempId: "a.he.o",
        a_hero_getHeroDisplayByTempId_args: {
            userId: "_0",
            tempId: "_1"
        },
        a_hero_getShowHeroData: "a.he.o1",
        a_hero_getShowHeroData_args: {
            userId: "_0"
        },
        a_hero_wearAllRune: "a.he.p",
        a_hero_wearAllRune_args: {
            tempId: "_0"
        },
        a_hero_autoInfuseSwitch: "a.he.q",
        a_hero_autoInfuseSwitch_args: {
            isOpenIn: "_0"
        },
        a_hero_extraInfuse: "a.he.q1",
        a_hero_extraInfuse_args: {
            type: "_0"
        },
        a_hero_saveFightList: "a.he.q2",
        a_hero_saveFightList_args: {
            fightArr: "_0"
        },
        a_hero_saveHeroTmpId: "a.he.q3",
        a_hero_saveHeroTmpId_args: {
            hid: "_0",
            tid: "_1"
        },
        a_hero_holyActivate: "a.he.r",
        a_hero_holyActivate_args: {
            tempId: "_0",
            index: "_1"
        },
        a_hero_holyFos: "a.he.s",
        a_hero_holyFos_args: {
            tempId: "_0",
            index: "_1",
            items: "_2"
        },
        a_hero_receiveHeroTask: "a.he.t",
        a_hero_receiveHeroTask_args: {
            tempId: "_0", //英雄id
            index: "_1" //第几个任务
        },
        a_hero_updatePartnerCombat: "a.he.u",
        a_hero_updatePartnerCombat_args: {
            heroId: "_0", //英雄id
            combat: "_1" //伙伴总战力
        },
        a_hero_updateHolyCombat: "a.he.u1",
        a_hero_updateHolyCombat_args: {
            heroId: "_0", //英雄id
            combat: "_1" //深渊装备总战力
        },
        a_hero_actHolyRes : "a.he.a1",
        a_hero_actHolyRes_args : {
            heroId : "_0",//英雄id
            lvlist : "_1"//深渊装备等级数组
        },
        a_hero_addMagicPoint : "a.he.v",
        a_hero_addMagicPoint_args : {
            heroId : "_0",//英雄id
            bookType : "_1"//魔书类型
        },
        a_hero_resetMagicPoint : "a.he.v1",
        a_hero_resetMagicPoint_args : {
            heroId : "_0"//英雄id
        },
        a_lottery_lottery: "a.l.a",
        a_lottery_lottery_args: {
            type: "_0",
            count: "_1"
        },
        a_lottery_getTreasureChest: "a.l.b",
        a_lottery_getInfo: "a.l.c",
        a_task_getInfo: "a.t.a",
        a_task_taskAward: "a.t.b",
        a_task_taskAward_args: {
            taskId: "_0"
        },
        a_task_achieveTaskAwardAll: "a.t.b1",
        a_task_getVitalityChest: "a.t.c",
        a_task_getVitalityChest_args: {
            index: "_0"
        },
        a_task_getWeekVitalityChest: "a.t.d",
        a_task_getWeekVitalityChest_args: {
            index: "_0"
        },
        a_task_ratifyEntrust: "a.t.e", //批准委托
        a_task_ratifyEntrust_args: {
            index: "_0" //委托下标
        },
        a_task_receiveEntrustAward: "a.t.f", //领取委托奖励
        a_task_receiveEntrustAward_args: {
            index: "_0" //委托下标
        },
        a_pk_buyPKNum: "a.p.a",
        a_pk_getPKUserList: "a.p.b",
        a_pk_getPKUserData: "a.p.c",
        a_pk_getPKUserData_args: {
            userId: "_0"
        },
        a_pk_fight: "a.p.d",
        a_pk_fight_args: {
            enemyId: "_0",
            isNPC: "_1",
            fightType: "_2"
        },
        a_pk_getEnemyList: "a.p.e",
        a_pk_getUserRanks: "a.p.f",
        a_pk_getRank: "a.p.g",
        a_pk_changeSign: "a.p.h",
        a_pk_changeSign_args: {
            sign: "_0"
        },
        a_pk_setRead: "a.p.i",
        a_pk_skip: "a.p.j",
        a_pk_pickRankAward: "a.p.k",
        a_pk_getEnemyRecord: "a.p.l",
        a_pk_getEnemyRecord_args: {
            enemyId: "_0"
        },
        a_pk_getList: "a.p.m",
        a_pkOut_open: "a.po.a",
        a_pkOut_getEnemyList: "a.po.b",
        a_pkOut_getRevengeEnemyList: "a.po.b1",
        a_pkOut_refreshEnemy: "a.po.c",
        a_pkOut_start: "a.po.d",
        a_pkOut_start_args: {
            enemyId: "_0",
            fightType: "_1",
            isRevenge: "_2"
        },
        a_pkOut_end: "a.po.e",
        a_pkOut_end_args: {
            isWin: "_0",
            enemyId: "_1",
            fightData: "_2",
            fightType: "_3",
            isRevenge: "_4"
        },
        a_pkOut_getRankList: "a.po.f",
        a_pkOut_getMyRank: "a.po.g",
        a_pkOut_getPkRecordList: "a.po.h",
        a_pkOut_getRankPkRecordList: "a.po.h1",
        a_pkOut_setPkRecordRead: "a.po.i",
        a_pkOut_dealRecord: "a.po.j",
        a_pkOut_dealRecord_args: {
            fightType: "_0"
        },
        a_pkOut_clearPkValue: "a.po.k",
        a_pkOut_resetBePkKill: "a.po.l",
        a_pkOut_incognito: "a.po.m",
        a_pkOut_getTreasurePkRecordList: "a.po.n",
        a_shop_getInfo: "a.s.a",
        a_shop_getInfo_args: {
            type: "_0"
        },
        a_shop_refreshExShop: "a.s.b",
        a_shop_refreshExShop_args: {
            type: "_0",
            lvlRefresh: "_1"
        },
        a_shop_buy: "a.s.c",
        a_shop_buy_args: {
            index: "_0",
            type: "_1",
            num: "_2"
        },
        a_shop_buyAll: "a.s.d",
        a_shop_buyAll_args: {
            type: "_0"
        },
        a_shop_laba: "a.s.e",
        a_shop_laba_args: { type: "_0", guide: "_1", num: "_2" },
        a_copy_getInfo: "a.c.a",
        a_copy_getInfo_args: {
            type: "_0"
        },
        a_copy_buyCopyCount: "a.c.b",
        a_copy_buyCopyCount_args: {
            type: "_0",
            copyId: "_1"
        },
        a_copy_buyEquipTessera: "a.c.c",
        a_copy_buyRealmTessera: "a.c.d",
        a_copy_copyWipe: "a.c.e",
        a_copy_copyWipe_args: {
            copyId: "_0",
            num: "_1"
        },
        a_copy_start: "a.c.f",
        a_copy_start_args: {
            copyId: "_0",
            biCost: "_1"
        },
        a_copy_end: "a.c.g",
        a_copy_end_args: {
            copyId: "_0",
            fightData: "_1",
            isWin: "_2"
        },
        a_copy_updateWinningStreak: "a.c.h",
        a_copy_updateWinningStreak_args: {
            copyId: "_0"
        },
        a_copy_setRead: "a.c.i",
        a_copy_setRead_args: {
            copyId: "_0"
        },
        a_copy_guildStart: "a.c.j",
        a_copy_guildStart_args: {
            copyId: "_0",
            bossId: "_1"
        },
        a_copy_guildEnd: "a.c.k",
        a_copy_guildEnd_args: {
            copyId: "_0",
            bossId: "_1",
            isWin: "_2"
        },
        a_copy_guildCopyAward: "a.c.l",
        a_copy_guildCopyAward_args: {
            type: "_0",
            typeId: "_1"
        },
        a_copy_guildCopyReset: "a.c.m",
        a_copy_clearGuildCopy: "a.c.n",
        a_copy_clearGuildCopy_args: {
            bossId: "_0"
        },
        a_copy_paTaAward: "a.c.o",
        a_copy_paTaAward_args: {
            copyId: "_0"
        },
        a_copy_paTaTreasury: "a.c.o1",
        a_copy_paTaTreasury_args: {
            free: "_0" //是否为免费，免费为1，付费为0
        },
        a_copy_normalAward: "a.c.p",
        a_copy_normalAward_args: {
            copyId: "_0"
        },
        a_copy_syCopyLottery: "a.c.q",
        a_copy_syCopyLottery_args: {
            index: "_0"
        },
        a_copy_getCopyLootRecordList: "a.c.r",
        a_copy_buyPataPower: "a.c.s",
        a_crystal_getInfo: "a.cr.a",
        a_crystal_saveProgress: "a.cr.b",
        a_crystal_saveProgress_args: {
            hp: "_0",
            hpNum: "_1",
            nextReplayTime: "_2"
        },
        a_crystal_finish: "a.cr.c",
        a_crystal_finish_args: {
            crystalId: "_0"
        },
        a_crystal_pickAward: "a.cr.d",
        a_crystal_pickAward_args: {
            crystalId: "_0"
        },
        a_crystal_useSkill: "a.cr.e",
        a_crystal_useSkill_args: {
            index: "_0"
        },
        a_crystal_refreshSkillCd: "a.cr.f",
        a_crystal_refreshSkillCd_args: {
            index: "_0"
        },
        a_rank_getRankList: "a.r.a",
        a_rank_getRankList_args: {
            rankType: "_0"
        },
        a_rank_getUserRank: "a.r.b",
        a_rank_getUserRank_args: {
            rankType: "_0"
        },
        a_rank_allRankArr: "a.r.c",
        a_rank_allRankArr_args: {
            rankType: "_0"
        },
        a_rank_getGuildRank: "a.r.d",
        a_rank_getGuildRank_args: {
            rankType: "_0"
        },
        a_rebirth_rebirth: "a.rb.a",
        a_rebirth_buyRebirth: "a.rb.b",
        a_rebirth_buyRebirth_args: {
            index: "_0",
            num: "_1"
        },
        a_recharge_getInfo: "a.rc.a",
        a_recharge_recharge: "a.rc.b",
        a_recharge_recharge_args: {
            rechargeId: "_0",
            channelId: "_1",
            receiptData: "_2"
        },
        a_recharge_getTodayCount: "a.rc.c",
        a_recharge_getAllCount: "a.rc.d",
        a_recharge_getRequest: "a.rc.e",
        a_recharge_getRequest_args: {
            rechargeId: "_0",
            goodsId: "_1"
        },
        a_recharge_handleRequest: "a.rc.g",
        a_recharge_getFake: "a.rc.h",
        a_recharge_checkPayResult: "a.rc.i",
        a_recharge_checkPayResult_args: {
            orderNo: "_0",
            payData: "_1"
        },
        a_redEnvelope_getList: "a.re.a",
        a_redEnvelope_sendRedEnvelope: "a.re.b",
        a_redEnvelope_sendRedEnvelope_args: {
            type: "_0",
            spItemId: "_1",
            amount: "_2",
            personNum: "_3",
            wish: "_4"
        },
        a_redEnvelope_syncRedEnvelope: "a.re.c",
        a_redEnvelope_getNewList: "a.re.d",
        a_redEnvelope_getNewList_args: {
            lastId: "_0"
        },
        a_redEnvelope_receiveBonus: "a.re.e",
        a_redEnvelope_receiveBonus_args: {
            redEnvelopeId: "_0"
        },
        a_redEnvelopePersonal_getInfo: "a.rp.a",
        a_chat_getNewList: "a.ch.a",
        a_chat_getNewList_args: {
            lastId: "_0",
            guildId: "_1",
            guildLastId: "_2"
        },
        a_chat_getNewSysMsgList: "a.ch.hda",
        a_chat_getNewSysMsgList_args: {
            lastId: "_0"
        },
        a_chat_sendData: "a.ch.b",
        a_chat_sendData_args: {
            content: "_0",
            lastId: "_1",
            type: "_2",
            guildId: "_3",
            guildLastId: "_4",
            isLittleHorn: "_5"
        },
        a_coupon_use: "a.co.a",
        a_coupon_use_args: {
            code: "_0"
        },
        a_coffers_getInfo: "a.cof.a",
        a_coffers_build: "a.cof.b",
        a_coffers_addBuff: "a.cof.b1",
        a_coffers_getLootRecordArr: "a.cof.c",
        a_coffers_getDefeseRecord: "a.cof.c1",
        a_coffers_getDefeseData: "a.cof.d",
        a_coffers_getEnemyDefeseData: "a.cof.d1",
        a_coffers_getEnemyDefeseData_args: {
            serverId: "_0"
        },
        a_coffers_getServerArr: "a.cof.e",
        a_coffers_fightStart: "a.cof.f",
        a_coffers_fightStart_args: {
            serverId: "_0",
            door: "_1"
        },
        a_coffers_fightEnd: "a.cof.f2",
        a_coffers_fightEnd_args: {
            serverId: "_0",
            door: "_1",
            isWin: "_2",
            fightData: "_3"
        },
        a_coffers_fightCoffersStart: "a.cof.g",
        a_coffers_fightCoffersStart_args: {
            serverId: "_0"
        },
        a_coffers_fightCoffersEnd: "a.cof.g1",
        a_coffers_fightCoffersEnd_args: {
            hurt: "_0",
            serverId: "_1",
            fightData: "_2"
        },
        a_sdk_getVip: "a.sd.a",
        a_smelt_smelt: "a.sm.a",
        a_smelt_smelt_args: {
            equipArr: "_0",
            choColor: "_1"
        },
        a_smelt_compound: "a.sm.b",
        a_smelt_compound_args: {
            compoundId: "_0",
            compoundNum: "_1"
        },
        a_smelt_wearParRing: "a.sm.c",
        a_smelt_wearParRing_args: {
            tempId: "_0",
            breakId: "_1"
        },
        a_smelt_ringBreak: "a.sm.d",
        a_smelt_ringBreak_args: {
            tempId: "_0",
            breakId: "_1"
        },
        a_item_sellItems: "a.it.a",
        a_item_sellItems_args: {
            itemId: "_0",
            itemNum: "_1"
        },
        a_treasure_spies: "a.tr.a",
        a_treasure_getExPkOutInfo: "a.tr.b",
        a_treasure_open: "a.tr.c",
        a_treasure_open_args: {
            id: "_0"
        },
        a_treasure_compose: "a.tr.d",
        a_treasure_compose_args: {
            itemId: "_0"
        },
        a_talisman_useTrumpItem: "a.tm.a",
        a_talisman_useTrumpItem_args: {
            itemId: "_0"
        },
        a_talisman_wearTrump: "a.tm.b",
        a_talisman_wearTrump_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_upTrumpLvl: "a.tm.c",
        a_talisman_upTrumpLvl_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_upTrumpStar: "a.tm.d",
        a_talisman_upTrumpStar_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_upHeroStar: "a.tm.d1",
        a_talisman_upHeroStar_args: {
            tempId: "_0"
        },
        a_talisman_recastTrump: "a.tm.e",
        a_talisman_recastTrump_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_compoundTrump: "a.tm.f",
        a_talisman_compoundTrump_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_baptizeTrump: "a.tm.g",
        a_talisman_baptizeTrump_args: {
            tempId: "_0",
            trumpId: "_1",
            isCheck: "_2",
            baptizeNum: "_3" //次数
        },
        a_talisman_confirmBaptizeTrump: "a.tm.h",
        a_talisman_confirmBaptizeTrump_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_cancelBaptizeTrump: "a.tm.i",
        a_talisman_cancelBaptizeTrump_args: {
            tempId: "_0",
            trumpId: "_1"
        },
        a_talisman_updateCombat: "a.tm.j",
        a_talisman_updateCombat_args: {
            tempId: "_0",
            combat: "_1"
        },
        a_talisman_giveGiftToHero: "a.tm.k",
        a_talisman_giveGiftToHero_args: {
            tempId: "_0" //英雄配置文件id
        },
        a_talisman_activeForever: "a.tm.l",
        a_talisman_activeForever_args: {
            tempId: "_0" //英雄配置文件id
        },
        a_expedition_getInfo: "a.ex.a",
        a_expedition_wearSoul: "a.ex.b",
        a_expedition_wearSoul_args: {
            tempId: "_0",
            soulId: "_1"
        },
        a_expedition_startBattle: "a.ex.c",
        a_expedition_startBattle_args: {
            stageId: "_0"
        },
        a_expedition_endBattle: "a.ex.d",
        a_expedition_endBattle_args: {
            isWin: "_0",
            herosHp: "_1"
        },
        a_expedition_buyBlackItem: "a.ex.e",
        a_expedition_buyBlackItem_args: {
            itemId: "_0"
        },
        /**
         * 获得雇佣数据
         * @args
         */
        a_employ_getInfo: "a.ep.a",
        /**
         * 雇佣
         * @args {id:"雇佣id"}
         */
        a_employ_employ: "a.ep.b",
        a_employ_employ_args: {
            idx: "_0"
        },
        /**
         * 刷新雇佣列表
         * @args
         */
        a_employ_refresh: "a.ep.c",
        /**
         * 减少探索实践
         * @args
         */
        a_employ_reduceCD: "a.ep.d",
        /**
         * 点击领取奖励信息
         * @args {idx:"奖励索引"}
         */
        a_employ_reward: "a.ep.e",
        a_employ_reward_args: {
            idx: "_0"
        },
        /**
         * 探索失败，领取失败奖励
         * @args
         */
        a_employ_feedback: "a.ep.f",
        a_employ_getRewardHistory: "a.ep.g",
        a_employ_getRewardHistory_args: {
            type: "_0"
        },
        c_account_enterGame: "c.a.a",
        c_account_enterGame_args: {
            accountId: "_0",
            loginKey: "_1",
            serverIndexId: "_2"
        },
        c_account_createUser: "c.a.b",
        c_account_createUser_args: {
            name: "_0",
            heroTempId: "_1",
            sex: "_2",
            serverIndexId: "_3",
            shareKey: "_4",
            loginKey: "_5",
            accountId: "_6"
        },
        c_account_getThirdUserInfo: "c.a.hda",
        c_net_connect: "c.n.a",
        c_net_disconnect: "c.n.b",
        c_net_disconnect_args: {
            sessionId: "_0"
        },
        c_net_getServerDate: "c.n.c",
        c_net_preLoad: "c.n.d",
        h_account_login: "h.a.a",
        h_account_login_args: {
            name: "_0",
            pwd: "_1",
            channelId: "_2"
        },
        h_account_loginBySdk: "h.a.a1",
        h_account_loginBySdk_args: {
            channelId: "_0",
            sdkData: "_1",
            deviceId: "_2"
        },
        h_account_register: "h.a.c",
        h_account_register_args: {
            name: "_0",
            pwd: "_1",
            channelId: "_2",
            deviceId: "_3"
        },
        h_notice_getNewOne: "h.nc.a",
        h_notice_getList: "h.nc.b",
        h_protocolContent_getInfo: "h.pc.a",
        h_serverInfo_getServerList: "h.s.a",
        h_serverInfo_getServerList_args: {
            isTest: "_0"
        },
        h_serverInfo_getServerInfo: "h.s.c",
        h_serverInfo_getServerInfo_args: {
            id: "_0"
        },
        h_serverInfo_getServerDate: "h.s.e",
        h_serverInfo_getUserServers: "h.s.f",
        h_serverInfo_getUserServers_args: {
            accountId: "_0"
        },
        h_serverInfo_getaccountServers: "h.s.g",
        h_serverInfo_getaccountServers_args: {
            openId: "_0",
            appId: "_1",
            isTest: "_2"
        },
        h_kefu_getList: "h.cs.hda",
        h_kefu_getList_args: {
            lastId: "_0",
            openId: "_1"
        },
        h_kefu_sendData: "h.cs.hdb",
        h_kefu_sendData_args: {
            lastId: "_0",
            content: "_1",
            openId: "_2",
            nickname: "_3",
            vipLevel: "_4"
        }
        // admin_coffers_lootDefense: "admin.coffers.a",
        // admin_coffers_lootDefense_args: {
        //     attackData: "_0",
        //     door: "_1"
        // },
        // admin_coffers_lootCoffersDefense: "admin.coffers.a1",
        // admin_coffers_lootCoffersDefense_args: {
        //     hurt: "_0",
        //     breakNum: "_1"
        // },
        // admin_coffers_getCache: "admin.coffers.b",
        // admin_coffers_resetPoints: "admin.coffers.c",
        // admin_coffers_updateCache: "admin.coffers.d",
        // admin_coffers_updateCache_args: {
        //     data: "_0"
        // },
        // admin_guild_getCache: "admin.guild.a",
        // admin_guild_getGuildById: "admin.guild.b",
        // admin_guild_getGuildById_args: {
        //     id: "_0"
        // },
        // admin_guild_updateCache: "admin.guild.c",
        // admin_guild_updateCache_args: {
        //     id: "_0",
        //     data: "_1"
        // },
        // admin_guild_getZombieGuild: "admin.guild.d",
        // admin_guild_clearZombieGuild: "admin.guild.e",
        // admin_guild_clearZombieGuild_args: {
        //     id: "_0",
        //     data: "_1"
        // },
        // admin_guild_chairmanImpeach: "admin.guild.f",
        // admin_boss_getBossData: "admin.boss.a",
        // admin_boss_getBossData_args: {
        //     bossId: "_0"
        // },
        // admin_boss_getUserCache: "admin.boss.a1",
        // admin_boss_getUserCache_args: {
        //     bossId: "_0"
        // },
        // admin_boss_getGuildById: "admin.boss.a2",
        // admin_boss_getGuildById_args: {
        //     id: "_0"
        // },
        // admin_boss_updateBossCache: "admin.boss.b",
        // admin_boss_updateBossCache_args: {
        //     data: "_0"
        // },
        // admin_boss_updateUserCache: "admin.boss.c",
        // admin_boss_updateUserCache_args: {
        //     id: "_0",
        //     data: "_1"
        // },
        // admin_chat_serversChat: "admin.chat.a",
        // admin_chat_serversChat_args: {
        //     nickName: "_0",
        //     vip: "_1",
        //     content: "_2",
        //     isGM: "_3",
        //     guildName: "_4",
        //     medalTitle: "_5",
        //     isLittleHorn: "_6"
        // },
        // admin_guildWar_lootDefense: "admin.guildWar.a",
        // admin_guildWar_lootDefense_args: {
        //     attackData: "_0",
        //     isWin: "_1",
        //     defenceData: "_2"
        // },
        // admin_guildWar_pushBeFightRecord: "admin.guildWar.b",
        // admin_guildWar_pushBeFightRecord_args: {
        //     guildId: "_0",
        //     data: "_1"
        // },
        // admin_guildWar_getCurServerGuildWarObj: "admin.guildWar.c",
        // admin_guildWar_enter100User: "admin.guildWar.d",
        // admin_guildWarSync_getSyncServer: "admin.guildWarSync.a",
        // admin_guildWarSync_getSyncServer_args: {
        //     curServerData: "_0"
        // },
        // admin_treasure_getTreasureCash: "admin.treasure.a",
        // admin_treasure_getTreasureByUserId: "admin.treasure.b",
        // admin_treasure_setTreasureByUserId: "admin.treasure.c",
        // admin_treasure_setTreasureByUserId_args: {
        //     userId: "_0"
        // }
    };

