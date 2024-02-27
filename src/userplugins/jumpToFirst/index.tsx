/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */


import { addContextMenuPatch, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { classNameFactory } from "@api/Styles";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Menu } from "@webpack/common";
import { Channel } from "discord-types/general";


/* import DoubleDownArrow from "./DoubleDownArrow"; */


const Kangaroo = findByPropsLazy("jumpToMessage");

export default definePlugin({
    name: "JumpToFirst",
    description: "Adds a context menu option to jump to the first message of a channel",
    authors:
        [
            Devs.Samwich
        ],
    start() {
        addContextMenuPatch("message", Patch);
    },
    stop() {
        removeContextMenuPatch("message", Patch);
    }
});


const Patch: NavContextMenuPatchCallback = (children, { channel }: { channel: Channel; }) => () => {
    children.push(
        <Menu.MenuItem id="jumptofirst" label="Jump To First Message" action={() => jumpToFirstButGood(channel)}></Menu.MenuItem>
    );
};



function jumpToFirstButGood(props) {
    const messageId = "0"; // Set messageId to 0
    const channelid = props.id;

    {
        Kangaroo.jumpToMessage({
            channelId: channelid,
            messageId,
            flash: false,
            jumpType: "INSTANT"
        });
    }
}

