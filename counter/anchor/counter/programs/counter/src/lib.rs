use anchor_lang::prelude::*;

declare_id!("BDXN7XF9nXeBfRrqTooF8XRdv8SCG2GT1GHi5KNkT1im");

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

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        msg!("Previous Count: { }", counter.count);

        counter.count += 1;
        msg!("Current Count1: { }", counter.count);

        counter.count = counter.count.checked_add(1).unwrap();
        msg!("Current Count2: { }", counter.count);

        counter.count = counter.count.checked_add(1).ok_or(ProgramError::InvalidArgument)?;
        msg!("Current Count3: { }", counter.count);
        
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


#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}
