import { range } from './lib/range'
import { GitHubUser } from './lib/GitHubUser'
import { getLongestStreak } from './getLongestStreak'
import { getCurrentStreak } from './getCurrentStreak'
import { convertToTable } from './lib/convertToTable'
import { Statistics } from './type'
import { calcContributionsStatistics } from './lib/calcContributionsStatistics'

interface Row {
  'Category': string
  '   From    ~     To    ': string
  'Day Count': string
  'Sum': string
  'Max': string
  'Min': string
  'Mean': string
  'Std dev': string
}

const convertStatisticsToRow = (category: string, statistics: Statistics): Row => ({
  Category: category,
  '   From    ~     To    ': statistics.days > 0 ? `${statistics.from} ~ ${statistics.to}` : '',
  'Day Count': statistics.days.toString() + (statistics.days > 1 ? ' days' : ' day '),
  Sum: statistics.sum.toString(),
  Max: statistics.max.toString(),
  Min: statistics.min.toString(),
  Mean: statistics.mean.toFixed(2),
  'Std dev': statistics.stddev.toFixed(2)
})

const main = async () => {
  const username = process.argv[2]
  const user = new GitHubUser(username)
  const { created_at: createdAt } = await user.getUserInfo()
  const joinedYear = parseInt(createdAt.substring(0, 4), 10)
  const joinedDay = createdAt.substring(0, 10)
  const now = new Date()
  const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`

  const annualDailyContributionsMaps = await Promise.all(
    range(joinedYear, now.getFullYear() + 1).map(year => user.getAnnualDailyContributions(year))
  )

  const annualDailyContributions = annualDailyContributionsMaps.flat()
  const allDailyContributions = annualDailyContributions.slice(
    annualDailyContributions.findIndex(contribution => contribution.day === joinedDay),
    annualDailyContributions.findIndex(contribution => contribution.day === today) + 1
  )
  const currentStreak = getCurrentStreak(allDailyContributions)
  const longestStreak = getLongestStreak(allDailyContributions)
  const rows = [
    convertStatisticsToRow('All Contributions', calcContributionsStatistics(allDailyContributions)),
    convertStatisticsToRow('Current Streak', currentStreak.statistics),
    convertStatisticsToRow('Longest Streak', longestStreak.statistics)
  ]
  const table = convertToTable(rows, ['Category', '   From    ~     To    ', 'Day Count', 'Sum', 'Max', 'Min', 'Mean', 'Std dev'])
  console.log(table)
}

main()
  .catch(({ message }) => {
    console.error(message)
  })
