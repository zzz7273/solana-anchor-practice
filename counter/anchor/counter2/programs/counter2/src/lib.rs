use anchor_lang::prelude::*;

declare_id!("J8QQE7ZVgVDQNFehx4orLCuVJTieyCacDBADHv8AhHQC");

#[program]
pub mod counter2 {
    use super::*;

    pub fn create_counter(ctx: Context<CreateCounter>, max_value: u64, counter_name: String, only_owner: bool ) -> Result<()> {
        require!(counter_name.len() <= MAX_NAME_LENGTH, CounterError::NameTooLong);

        let c = &mut ctx.accounts.counter;
        c.count = 0;
        c.max_value = max_value;
        c.counter_name = counter_name;
        c.only_owner = only_owner; 
        c.remark = String::new(); // String::from("");

        msg!("Counter PDA Created");
        msg!("Counter Name: { }", c.counter_name);

        Ok(())
    }

    pub fn set_only_owner(ctx: Context<SetOnlyOwner>, counter_name: String, only_owner: bool) -> Result<()> {
        let c = &mut ctx.accounts.counter;

        c.only_owner = only_owner;
        msg!("Counter Only Owner now is: {}", c.only_owner);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>, counter_name: String) -> Result<()> {
        let c = &mut ctx.accounts.counter;

        msg!("ctx.accounts.user.is_signer: {}", ctx.accounts.user.is_signer);

        if c.only_owner {
            require!(ctx.accounts.owner.key() == ctx.accounts.user.key(), CounterError::OnlyOwner);
        }

        c.count += 1;
        if c.count == c.max_value {
            c.count = 0; // Reset to zero when max value is reached
        }

        msg!("Counter Incremented: {}", c.count);
        Ok(())
    }

    pub fn reset_counter(ctx: Context<Increment>) -> Result<()> {
        let c = &mut ctx.accounts.counter;

        if c.only_owner {
            require!(ctx.accounts.owner.key() == ctx.accounts.user.key(), CounterError::OnlyOwner);
        }

        c.count = 0;

        msg!("Counter Reset to: {}", c.count);
        Ok(())
    }

    pub fn set_remark(ctx: Context<SetRemark>, counter_name: String, remark: String) -> Result<()> {
        let c = &mut ctx.accounts.counter;
        
        require!(remark.len() <= MAX_REMARK_LENGTH, CounterError::RemarkTooLong);

        if c.only_owner {
            require!(ctx.accounts.owner.key() == ctx.accounts.user.key(), CounterError::OnlyOwner);
        }

        c.remark = remark;

        msg!("Counter Remark now is: {}", c.remark);
        Ok(())
    }
}

#[error_code]
enum CounterError {
    #[msg("Counter Name too long")]
    NameTooLong,
    #[msg("Only Owner")]
    OnlyOwner,
    #[msg("Remark Too Long")]
    RemarkTooLong,
}

const MAX_NAME_LENGTH: usize = 20;
const MAX_REMARK_LENGTH: usize = 100;

#[account]
#[derive(InitSpace)]
pub struct CounterInfo {
    pub count: u64,

    pub max_value: u64, // 计数器达到最大值时归零。

    #[max_len(MAX_NAME_LENGTH)]
    pub counter_name: String,       // 4 + len()

    pub only_owner: bool, // 计数器是否只能由创建者操作。

    #[max_len(MAX_REMARK_LENGTH)]
    pub remark: String, // 4 + len()，可选的备注信息。
}

const DISCRIMINATOR: usize = 8;

#[derive(Accounts)]
#[instruction(max_value: u64, counter_name:String)]
// #[instruction(counter_name:String)]
pub struct CreateCounter<'info> {
  #[account(
    init,
    seeds = [b"", counter_name.as_bytes(), owner.key().as_ref()],
    bump,
    payer = owner,
    space = DISCRIMINATOR + CounterInfo::INIT_SPACE,
  )]
  pub counter: Account<'info, CounterInfo>,
  
  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(counter_name:String)]
pub struct SetOnlyOwner<'info> {
  #[account(
    mut, // 这里有坑, 如果没有mut，系统并不会报错，但数据没有发生变化!!!!
    seeds = [counter_name.as_bytes(), owner.key().as_ref()],
    bump
  )]
  pub counter: Account<'info, CounterInfo>,
  
  pub owner: Signer<'info>,
}

// https://www.anchor-lang.com/docs/references/account-types

#[derive(Accounts)]
#[instruction(counter_name:String)]
pub struct Increment<'info> {
  #[account(
    mut,
    seeds = [counter_name.as_bytes(), owner.key().as_ref()],
    bump
  )]
  pub counter: Account<'info, CounterInfo>,

  /// CHECK: AccountInfo is an unchecked account
  pub owner: AccountInfo<'info>,  // 这里只需要获取账户的公钥.
  
  pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(first_param_is_name:String)]
pub struct SetRemark<'info> {
  #[account(
    mut,
    seeds = [first_param_is_name.as_bytes(), owner.key().as_ref()],
    bump,
        // realloc = DISCRIMINATOR + MovieAccountState::INIT_SPACE,
        // realloc::payer = initializer,
        // realloc::zero = true,
  )]
  pub counter: Account<'info, CounterInfo>,
  
  /// CHECK: AccountInfo is an unchecked account
  pub owner: AccountInfo<'info>,  // 这里只需要获取账户的公钥.
  
  pub user: Signer<'info>,
}


