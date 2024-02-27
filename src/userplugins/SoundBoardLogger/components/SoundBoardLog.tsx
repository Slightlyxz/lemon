/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import ErrorBoundary from "@components/ErrorBoundary";
import { Margins } from "@utils/margins";
import { classes, copyWithToast } from "@utils/misc";
import { openModal, ModalRoot, ModalContent, closeModal, ModalSize, ModalHeader, ModalCloseButton, ModalFooter } from "@utils/modal";
import { UserUtils, Clickable, Tooltip, Forms, Button, Text, useState, useEffect, ContextMenuApi, Menu, FluxDispatcher } from "@webpack/common";
import { Flex } from "@components/Flex";
import { User } from "discord-types/general";
import { clearLoggedSounds, getLoggedSounds } from "../store";
import { SoundLogEntry, getSoundboardVolume, playSound } from "../utils";
import { AvatarStyles, cl, getEmojiUrl, UserSummaryItem, downloadAudio, addListener, removeListener } from "../utils";
import { openMoreUsersModal } from "./MoreUsersModal";
import { openUserModal } from "./UserModal";
import { openCloneSoundModal } from "./CloneSoundModal";

export async function openSoundBoardLog(): Promise<void> {

    const data = await getLoggedSounds();
    const key = openModal(props => <ErrorBoundary>
        <ModalRoot {...props} size={ModalSize.LARGE}>
            <SoundBoardLog data={data} closeModal={() => closeModal(key)} />
        </ModalRoot>
    </ErrorBoundary>);

}

export default function SoundBoardLog({ data, closeModal }) {
    const [sounds, setSounds] = useState(data);
    const [users, setUsers] = useState<User[]>([]);
    const update = async () => setSounds(await getLoggedSounds());

    // Update the sounds state when a new sound is played
    useEffect(() => {
        const onSound = () => update();
        addListener(onSound);
        return () => removeListener(onSound);
    }, []);

    const avatarsMax = 2;

    // Update the users state when a new sound is played
    useEffect(() => {
        (async () => {
            /** Array of user IDs without a resolved user object */
            const missing = sounds
                .flatMap(sound => sound.users)                              // Get all users who have used any sound
                .map(user => user.id)                                       // Get their ID ( user is {id: string, plays: number[]} )
                .filter((id, index, self) => index === self.indexOf(id))    // Filter the array to remove non unique values
                .filter(id => !users.map(user => user.id).includes(id));    // Filter the IDs to only get the ones not already in the users state
            if (!missing.length) return;                                    // return if every user ID is already in users

            for (const id of missing) {
                const user = await UserUtils.getUser(id).catch(() => void 0);
                if (user) setUsers(u => [...u, user]);
            };
        })();
    }, [sounds]);

    function renderMoreUsers(item, itemUsers) {
        return (
            <Clickable
                className={AvatarStyles.clickableAvatar}
                onClick={() => {
                    onClickShowMoreUsers(item, itemUsers);
                }}
            >
                <Tooltip text={`${itemUsers.length - avatarsMax} other people used this sound...`}>
                    {({ onMouseEnter, onMouseLeave }) => (
                        <div
                            className={AvatarStyles.moreUsers}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                        >
                            +{itemUsers.length - avatarsMax}
                        </div>
                    )}
                </Tooltip>
            </Clickable>
        );
    }

    /** This function is called when you click the "Show more users" button. */
    function onClickShowMoreUsers(item: SoundLogEntry, users: User[]): void {
        openMoreUsersModal(item, users, onClickUser);
    };

    function onClickUser(item: SoundLogEntry, user: User) {
        openUserModal(item, user, sounds);
    }

    function SoundContextMenu({ item }) {
        const label = id => `soundboardlogger-${id}`;
        return (
            <Menu.Menu
                navId="soundboardlogger-sound-menu"
                onClose={() => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" })}
            >
                <Menu.MenuGroup label="Extra buttons">
                    <Menu.MenuItem
                        id={label('clone')}
                        label="Clone sound"
                        action={() => openCloneSoundModal(item)}
                    />
                </Menu.MenuGroup>
            </Menu.Menu>
        );
    }

    return (
        <>
            <ModalHeader className={cl("modal-header")}>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>SoundBoard log</Text>
                <ModalCloseButton onClick={closeModal} />
            </ModalHeader>
            <ModalContent className={classes(cl("modal-content"), Margins.top8)}>
                {sounds.length ? sounds.map(item => {
                    const itemUsers = users.filter(user => item.users.map(u => u.id).includes(user.id));

                    return (
                        <div
                            className={cl("sound")}
                            onContextMenu={(e) =>
                                ContextMenuApi.openContextMenu(e, () => <SoundContextMenu item={item} />)
                            }
                        >
                            <Flex flexDirection="row" className={cl("sound-info")}>
                                <img
                                    src={getEmojiUrl(item.emoji)}
                                    className={cl("sound-emoji")}
                                />
                                <Forms.FormText variant="text-xs/medium" className={cl("sound-id")}>{item.soundId}</Forms.FormText>
                            </Flex>
                            <UserSummaryItem
                                users={itemUsers.slice(0, avatarsMax)}  // Trimmed array to the size of max
                                count={item.users.length - 1}           // True size (counting users that aren't rendered) - 1
                                guildId={undefined}
                                renderIcon={false}
                                max={avatarsMax}
                                showDefaultAvatarsForNullUsers
                                showUserPopout
                                renderMoreUsers={() => renderMoreUsers(item, itemUsers)}
                                className={cl("sound-users")}
                                renderUser={(user: User) => (
                                    <Clickable
                                        className={AvatarStyles.clickableAvatar}
                                        onClick={() => {
                                            onClickUser(item, user);
                                        }}
                                    >
                                        <img
                                            className={AvatarStyles.avatar}
                                            src={user.getAvatarURL(void 0, 80, true)}
                                            alt={user.username}
                                            title={user.username}
                                        />
                                    </Clickable>
                                )}
                            />
                            <Flex flexDirection="row" className={cl("sound-buttons")}>
                                <Button color={Button.Colors.PRIMARY} size={Button.Sizes.SMALL} onClick={() => downloadAudio(item.soundId)}>Download</Button>
                                <Button color={Button.Colors.GREEN} size={Button.Sizes.SMALL} onClick={() => copyWithToast(item.soundId, "ID copied to clipboard!")}>Copy ID</Button>
                                <Tooltip text={`Soundboard volume: ${Math.floor(getSoundboardVolume())}%`}>
                                    {({ onMouseEnter, onMouseLeave }) =>
                                        <Button color={Button.Colors.BRAND} size={Button.Sizes.SMALL} onClick={() => playSound(item.soundId)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>Play Sound</Button>
                                    }
                                </Tooltip>
                            </Flex>
                        </div>
                    );
                }) :
                    <div style={{ textAlign: "center" }} className={Margins.top16}>
                        <img
                            src="https://raw.githubusercontent.com/fres621/assets/main/shiggy.png"
                            height="200px"
                        />
                        <Forms.FormText variant="text-sm/medium" style={{ color: "var(--text-muted)" }} className={Margins.bottom16}>No sounds logged yet. Join a voice chat to start logging!</Forms.FormText>
                    </div>
                }
            </ModalContent >
            <ModalFooter className={cl("modal-footer")}>
                <Button color={Button.Colors.RED} onClick={async () => { await clearLoggedSounds(); update(); }}>
                    Clear logs
                </Button>
            </ModalFooter>
        </>
    );
};