import { describe, it, expect, vi, beforeEach } from 'vitest'

// discordNotifier is CommonJS at the repo root; require it via the relative path
// so the test runs against the actual file the workflow consumes.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DiscordNotifier = require('../../discordNotifier')

interface NotifierLike {
  sendEmbed: (embed: unknown) => Promise<void>
  notifyNewSeason: (saveResult: unknown, data: unknown, uid: string) => Promise<void>
}

function makeNotifier(): NotifierLike & { sent: unknown[] } {
  const n = new DiscordNotifier('https://discord.test/webhook') as NotifierLike & { sent: unknown[] }
  n.sent = []
  n.sendEmbed = vi.fn(async (embed: unknown) => {
    n.sent.push(embed)
  })
  return n
}

describe('DiscordNotifier#notifyNewSeason', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('does nothing when no mode flagged a new-season write', async () => {
    const n = makeNotifier()
    await n.notifyNewSeason(
      {
        deadly: { isNew: false },
        shiyu: { isNew: false },
        voidfront: { isNew: false },
      },
      { deadly: {}, shiyu: {}, voidfront: {} },
      '123',
    )
    expect(n.sent).toHaveLength(0)
  })

  it('sends a single embed listing only the modes whose season is new', async () => {
    const n = makeNotifier()
    await n.notifyNewSeason(
      {
        deadly: { isNew: true, seasonId: 42 },
        shiyu: { isNew: false },
        voidfront: { isNew: true, seasonId: 'vf-7' },
      },
      {
        deadly: { data: { nick_name: 'Belle', total_score: 12345, total_star: 9 } },
        voidfront: {
          data: {
            void_front_battle_abstract_info_brief: {
              total_score: 6789,
              ending_record_name: 'Echoes of Eternity',
            },
          },
        },
      },
      '999',
    )

    expect(n.sent).toHaveLength(1)
    const embed = n.sent[0] as { fields: { name: string; value: string }[]; description: string }
    const names = embed.fields.map(f => f.name).join(' | ')
    expect(names).toMatch(/Deadly Assault/)
    expect(names).toMatch(/Void Front/)
    expect(names).not.toMatch(/Shiyu/)
    expect(embed.description).toContain('Belle')
    expect(embed.description).toContain('999')
  })

  it('handles a webhook with no URL configured (no throw)', async () => {
    // Construct a notifier with no URL; sendEmbed early-returns instead of throwing.
    const real = new DiscordNotifier(undefined)
    await expect(
      real.notifyNewSeason(
        { deadly: { isNew: true, seasonId: 1 }, shiyu: {}, voidfront: {} },
        { deadly: { data: { nick_name: 'X', total_score: 1, total_star: 0 } } },
        '1',
      ),
    ).resolves.toBeUndefined()
  })
})
