use anchor_lang::prelude::*;

declare_id!("8djcQNy8ZoJ8KgovwNUFsM5bB9BYLtD32vxUc2STumrN");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Counter Account Created");
        msg!("Current Count: { }", counter.count);
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
}

const DISCRIMINATOR: usize = 8;


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init,
        payer = user,
        space = DISCRIMINATOR + Counter::INIT_SPACE
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}