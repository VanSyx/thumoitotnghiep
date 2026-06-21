/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GuestRSVP {
  name: string;
  isAttending: boolean;
  guestCount: number;
  message: string;
  relationship: string;
  timestamp: string;
}

export interface GraduationWish {
  id: string;
  name: string;
  relationship: string;
  message: string;
  timestamp: string;
  isAttending: boolean;
  avatarColor: string;
}
