/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Menu } from "@webpack/common";
import { Channel } from "discord-types/general";
import type React from "react";

const JumpIcon = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" transform="scale(-1, -1)">
            <path fill="currentColor" d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z" />
        </svg>
    );
};

const jumper = findByPropsLazy("jumpToMessage");

function jumpToFirst(channel: Channel) {
    jumper.jumpToMessage({
        channelId: channel.id,
        messageId: "0",
        flash: false,
        jumpType: "INSTANT"
    });
}

const MessageContextMenuPatch: NavContextMenuPatchCallback = (children, { channel }) => {
    children.push(
        <Menu.MenuItem
            id="vc-jump-to-first"
            label="Go To First Message"
            action={() => jumpToFirst(channel)}
            icon={JumpIcon}
        />
    );
};

export default definePlugin({
    name: "JumpToFirst",
    description: "Adds a context menu option to jump to the first message of a channel",
    authors: [{ id: 119536078452424704n, name: "Slightly" }],
    contextMenus: {
        "message": MessageContextMenuPatch
    }
});
