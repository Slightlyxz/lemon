/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { getCurrentChannel } from "@utils/discord";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Menu } from "@webpack/common";
import type React from "react";


const cl = classNameFactory("vc-jtf-");


const Kangaroo = findByPropsLazy("jumpToMessage");

export default definePlugin({
    name: "JumpToFirst",
    description: "Adds a context menu option to jump to the first message of a channel",
    authors: [{ id: 119536078452424704n, name: "Slightly" }],
    contextMenus: {
        "message"(children, { id }: { id: string; }) {
            const channel = getCurrentChannel();

            children.push(
                <Menu.MenuItem
                    id="vc-jump-to-first"
                    label="Jump to First Message"
                    action={() => jumpToFirst(channel)}
                />
            );
        }

    }
});



function jumpToFirst(props) {
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

