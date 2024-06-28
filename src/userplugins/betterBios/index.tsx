/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "BetterBios",
    authors: [Devs.TheSun],
    description: "Improves Discord's bio redesign",
    patches: [{
        find: ".viewFullBio,",
        replacement: {
            match: /(?<=\(\),\[\i,\i\]=\i\.useState\(!1\),)(.{0,200})className:(\i.{0,50}.maxBioHeight\))(.{0,300})onClick:\(\)=>{.{0,300}}\)}/,
            replace: "[clamp,setClamp] = Vencord.Webpack.Common.React.useState(true)," +
                "$1 className: clamp ? $2 : null" +
                "$3 onClick: () => setClamp(!clamp)"
        }
    },
    {
        find: ".Messages.VIEW_ALL_ROLES,",
        replacement: [{
            match: /(?<=.useState\(null\),)(\i=\i\.useMemo.{0,300})(return null!=\i\?(\i)\.slice.{0,30}\i,\i\])\)/,
            replace: "[clamp, setClamp] = Vencord.Webpack.Common.React.useState(true)," +
                "$1 if (!clamp) return $3;" +
                "$2.concat(clamp))"
        }, {
            match: /onClick:(\i)(?=,className:\i.showMoreButton)/,
            replace: "onClick:() => (() =>{ try { setClamp(!clamp) } catch { $1() } })()"
        }]
    }]
});
