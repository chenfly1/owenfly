import { request } from 'umi';

/** 适用标准请求响应数据场景，消除 code 判断逻辑 */
const simpleReq = <T>(url: any, options: Record<string, any>) => {
  return new Promise<T>((resolve, reject) => {
    request<ResultData<T>>(url, options)
      .then((res) => {
        if (res.code === 'SUCCESS') {
          resolve(res.data);
        } else {
          reject(res);
        }
      })
      .catch((err) => reject(err));
  });
};

/** 获取全量的分页数据 */
export const getTotalPageSource = async <T>(
  pageReq: (
    params: { pageNo: number; pageSize: number } & Record<string, any>,
  ) => Promise<ResultPageData<T>['data']>,
  params: { pageNo: number; pageSize: number } & Record<string, any>,
  source: T[] = [],
  maxCount = 10,
  _count = 1,
): Promise<ResultPageData<T>['data']> => {
  try {
    const res = await pageReq(params);
    const newSource = source.concat(res?.items || []);
    if (res?.page?.totalItems) {
      if (res.page.totalItems > newSource.length && _count < maxCount) {
        await getTotalPageSource<T>(
          pageReq,
          { ...params, pageNo: params.pageNo + 1 },
          newSource,
          maxCount,
          _count + 1,
        );
      }
    }
    return {
      items: newSource,
      page: res.page,
    };
  } catch (err) {
    console.log(err);
    return {
      items: source,
      page: {
        page: 0,
        pageSize: 0,
        totalItems: 0,
        totalPage: 0,
      },
    };
  }
};

/** 获取计量位置树 */
export async function getMeasureTree() {
  return simpleReq<MeasureResTreeType>('/energy/mng/meter_space/tree', { method: 'GET' });
}

/** 获取次级计量位置 */
export async function getMeasureChildren(id: string, params?: any) {
  return request<ResultData<MeasureItemType[]>>(`/energy/mng/meter_space/children/${id}`, {
    method: 'GET',
    params,
  });
}

/** 获取分项列表 */
export async function getCategoryList(params: any) {
  return simpleReq<ResultPageData<CategoryItemType>['data']>('/energy/mng/ins_tag/page', {
    method: 'GET',
    params,
  });
}

/** 新增分项 */
export async function createCategory(data: Partial<CategoryItemType>) {
  return simpleReq<void>('/energy/mng/ins_tag', {
    method: 'POST',
    data,
  });
}

/** 更新分项 */
export async function updateCategory({ id, ...rest }: Partial<CategoryItemType>) {
  return simpleReq<void>(`/energy/mng/ins_tag/${id}`, {
    method: 'PUT',
    data: rest,
  });
}

/** 移除分项 */
export async function deleteCategory(id: string) {
  return simpleReq<void>(`/energy/mng/ins_tag/${id}`, {
    method: 'DELETE',
  });
}

/** 批量设置公区类型 */
export async function setPublicType(type: number, data: any) {
  return simpleReq<void>(`/energy/mng/ins/public_type/${type}`, {
    method: 'PUT',
    data,
  });
}

/** 批量设置计量位置 */
export async function setMeasure(id: number, data: any) {
  return simpleReq<void>(`/energy/mng/meter_space/${id}/ins`, {
    method: 'PUT',
    data,
  });
}

/** 获取仪表列表 */
export async function getMeterList(params: any) {
  return simpleReq<ResultPageData<MeterItemType>['data']>('/energy/mng/ins/page', {
    method: 'GET',
    params,
  });
}

/** 获取全量资源信息【一般应用于下拉列表场景】 */
export async function getTotoalSource(code: string, data?: any) {
  return simpleReq<Record<string, string>>(`/energy/mng/base/selection/${code}`, {
    method: 'POST',
    data: data || {},
  });
}

/** 仪表绑定分项 */
export async function bindMeterCategory(id: string, data: { insIds: string[] }) {
  return simpleReq<object>(`/energy/mng/ins_tag/ins/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 仪表解绑分项 */
export async function unbindMeterCategory(id: string, data: { insIds: string[] }) {
  return simpleReq<object>(`/energy/mng/ins_tag/ins/${id}`, {
    method: 'DELETE',
    data,
  });
}

/** 更新仪表信息 */
export async function updateMeter(id: string, data: any) {
  return simpleReq<object>(`/energy/mng/ins/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 换表操作 */
export async function switchMeter(id: string, data: any) {
  return simpleReq<object>(`/energy/mng/ins/exchange/${id}`, {
    method: 'POST',
    data,
  });
}

/** 查看仪表抄表信息 */
export async function getMeterRecordList(energyType: number, params: any) {
  return simpleReq<ResultPageData<MeterReadingType>['data']>(
    `/energy/mng/meter_record/${energyType}/page`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 查看仪表读数 */
export async function getMeterRecord(id: string) {
  return simpleReq<number>(`/energy/mng/ins/record/${id}`, {
    method: 'GET',
  });
}

/** 移除从表绑定关系 */
export async function unbindMeterRelation(data: any) {
  return simpleReq<void>(`/energy/mng/ins/remove_child`, {
    method: 'PUT',
    data,
  });
}

/** 绑定从表到指定主表 */
export async function bindMeterRelation(id: string, data: any) {
  return simpleReq<void>(`/energy/mng/ins/add_child/${id}`, {
    method: 'PUT',
    data,
  });
}
/** 查询仪表根节点信息 */
export async function getMeterRootNode() {
  return simpleReq<MeterItemType>(`/energy/mng/ins/root`, {
    method: 'GET',
  });
}

/** 移除计量位置 */
export async function removeMeasure(id: string) {
  return simpleReq<MeterItemType>(`/energy/mng/meter_space/children/${id}`, {
    method: 'DELETE',
  });
}

/** 批量移除计量位置 */
export async function batchRemoveMeasure(data: any) {
  return simpleReq<MeterItemType>(`/energy/mng/meter_space/children/delete/batch`, {
    method: 'POST',
    data,
  });
}

/** 更新计量位置信息 */
export async function updateMeasure(id: string, data: any) {
  return simpleReq<MeterItemType>(`/energy/mng/meter_space/children/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 新增子级计量位置 */
export async function createMeasure(id: string, data: any) {
  return simpleReq<MeterItemType>(`/energy/mng/meter_space/children/${id}`, {
    method: 'POST',
    data,
  });
}

/** 查询能耗预警列表 */
export async function getWarningList(params: any) {
  return simpleReq<ResultPageData<EnergyWarningEventType>['data']>(`/energy/mng/monitor/page`, {
    method: 'GET',
    params,
  });
}

/** 添加能耗预警事件 */
export async function createWaring(data: any) {
  return simpleReq<void>(`/energy/mng/monitor`, {
    method: 'POST',
    data,
  });
}

/** 更新能耗预警事件 */
export async function updateWaring(id: number, data: any) {
  return simpleReq<void>(`/energy/mng/monitor/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 停用能耗预警事件 */
export async function updateWaringState(id: number) {
  return simpleReq<void>(`/energy/mng/monitor/state/${id}`, {
    method: 'PUT',
  });
}

/** 移除能耗预警事件 */
export async function removeWaringState(id: number) {
  return simpleReq<void>(`/energy/mng/monitor/${id}`, {
    method: 'DELETE',
  });
}

/** 获取监测点列表 */
export async function getMonitorList({ id, ...params }: any) {
  return simpleReq<ResultPageData<EnergyMonitorType>['data']>(
    `/energy/mng/monitor/point/${id}/page`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 获取预警实例 */
export async function getMonitorInstance(params: any) {
  return simpleReq<ResultPageData<EnergyMonitorInstance>['data']>(
    `/energy/mng/monitor/instance/page`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 更新预警监测点上限和周期 */
export async function updateMonitorLimit(data: any) {
  return simpleReq<void>(`/energy/mng/monitor/point/period`, {
    method: 'PUT',
    data,
  });
}

/** 移除预警监测点 */
export async function removeMonitor(id: number) {
  return simpleReq<void>(`/energy/mng/monitor/point/${id}`, {
    method: 'DELETE',
  });
}

/** 更新预警监测点 */
export async function updateMonitor(id: string, data: any) {
  return simpleReq<void>(`/energy/mng/monitor/point/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 查询碳排放配置 */
export async function getCarbonConfig() {
  return simpleReq<CarbonConfigType>('/energy/mng/carbon_index/coe', {
    method: 'GET',
  });
}

/** 更新碳排放配置 */
export async function updateCarbonConfig(data: any) {
  return simpleReq<CarbonConfigType>('/energy/mng/carbon_index/coe', {
    method: 'PUT',
    data,
  });
}

/** 查询碳排放配置修改记录 */
export async function getCarbonHistory(params: any) {
  return simpleReq<ResultPageData<CarbonConfigHistory>['data']>(
    `/energy/mng/carbon_index/coe/log`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 查询碳指标记录 */
export async function getCarbonIndicatorList(params: any) {
  return simpleReq<ResultPageData<CarbonIndicatorType>['data']>(`/energy/mng/carbon_index/page`, {
    method: 'GET',
    params,
  });
}

/** 更新碳指标 */
export async function updateCarbonIndicator(id: number, data: any) {
  return simpleReq<void>(`/energy/mng/carbon_index/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 创建碳排指标 */
export async function createCarbonIndicator(data: any) {
  return simpleReq<void>(`/energy/mng/carbon_index`, {
    method: 'POST',
    data,
  });
}

/** 更新碳排指标状态 */
export async function updateCarbonIndicatorState(id: number) {
  return simpleReq<CarbonConfigType>(`/energy/mng/carbon_index/state/${id}`, {
    method: 'PUT',
  });
}

/** 移除碳排指标 */
export async function removeCarbonIndicator(id: number) {
  return simpleReq<CarbonConfigType>(`/energy/mng/carbon_index/${id}`, {
    method: 'DELETE',
  });
}

/** 批量更新碳指标状态 */
export async function batchUpdateCarbonIndicatorState(data: any) {
  return simpleReq<void>(`/energy/mng/carbon_index/state`, {
    method: 'PUT',
    data,
  });
}

/** 查询对应指标下的仪表 */
export async function getMeterWithCarbonIndicator(id: number, params: any) {
  return simpleReq<ResultPageData<CarbonIndicatorBindMeterType>['data']>(
    `/energy/mng/carbon_index/ins_page/${id}`,
    {
      method: 'GET',
      params,
    },
  );
}

/** 批量解绑指标下的仪表 */
export async function unbindMeterWithCarbonIncicator(id: number, data: any) {
  return simpleReq<CarbonConfigType>(`/energy/mng/carbon_index/binding/${id}`, {
    method: 'DELETE',
    data,
  });
}

/** 批量绑定指标下的仪表 */
export async function bindMeterWithCarbonIncicator(id: number, data: any) {
  return simpleReq<CarbonConfigType>(`/energy/mng/carbon_index/binding/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 查询用量报表 */
export async function getElectricEnergyReport(params: any) {
  return simpleReq<ResultPageData<EnergyReportType>['data']>(`/energy/mng/bi/statement/0/page`, {
    method: 'GET',
    params,
  });
}

/** 查询用量报表 */
export async function getWaterEnergyReport(params: any) {
  return simpleReq<ResultPageData<EnergyReportType>['data']>(`/energy/mng/bi/statement/1/page`, {
    method: 'GET',
    params,
  });
}

/** 查询主从用量信息 */
export async function getEnergyStatement() {
  return simpleReq<EnergyStatementType>(`/energy/mng/bi/statement/ins_tree`, {
    method: 'GET',
  });
}

/** 获取用电/用水统计量 */
export async function getEnergyConsumptionStatistic(data: any = {}) {
  return simpleReq<{
    currentMonth: MeterReadingItem; // 当月用量
    lastMonth: MeterReadingItem; // 上月用量
    precedingMonth: MeterReadingItem; // 前月用量
    compare: number;
  }>(`/energy/mng/bi/index/consumption`, {
    method: 'POST',
    data,
  });
}

/** 获取能耗超限告警统计量 */
export async function getEnergyWarningStatistic(data: any = {}) {
  return simpleReq<{
    today: number;
    yesterday: number;
    precedingDay: number;
    currentMonth: number;
    lastMonth: number;
    compareYesterday: number;
    compareLastMonth: number;
  }>(`/energy/mng/bi/index/limit_warn`, {
    method: 'POST',
    data,
  });
}

/** 获取碳指标转换统计量 */
export async function getEnergyCarbonStatistic(data: any = {}) {
  return simpleReq<{
    today: {
      carbon: number;
      carbonDioxide: number;
    };
    month: {
      carbon: number;
      carbonDioxide: number;
    };
    year: {
      carbon: number;
      carbonDioxide: number;
    };
    compare: number;
  }>(`/energy/mng/bi/index/carbon`, {
    method: 'POST',
    data,
  });
}

/** 获取用能趋势统计量 */
export async function getEnergyTrendingStatistic(data: any = {}) {
  return simpleReq<{
    water: Record<string, string>;
    electricity: Record<string, string>;
  }>(`/energy/mng/bi/index/consumption/trend`, {
    method: 'POST',
    data,
  });
}

/** 获取能源分项分部统计 */
export async function getEnergyCategoryStatistic(data: any = {}) {
  return simpleReq<{
    averageDosage: string;
    maximumProportion: string;
    minimumProportion: string;
    dosageDetail: {
      insTagId: string;
      insTagName: string;
      dosage: string;
    }[];
  }>(`/energy/mng/bi/ins_tag/collect`, {
    method: 'POST',
    data,
  });
}

/** 获取折碳分析列表 */
export async function getCarbonAnalysis(params: any) {
  return simpleReq<ResultPageData<CarbonAnalysis>['data']>(`/energy/mng/bi/carbon_index/page`, {
    method: 'GET',
    params,
  });
}

/** 获取折碳分析详情 */
export async function getCarbonAnalysisDetail(id: number) {
  return simpleReq<CarbonAnalysisDetail>(`/energy/mng/bi/carbon_index/${id}`, {
    method: 'GET',
  });
}

/** 获取预警统计信息 */
export async function getWarningStatisticDetail(params: any) {
  return simpleReq<WarningStatisticDetailRes>(`/energy/mng/bi/monitor`, {
    method: 'GET',
    params,
  });
}
/** 分页查询用能分析 */
export async function getMeterRecordPage(data: Record<string, any>) {
  return simpleReq<ResultPageData<MeterRecordType>['data']>(`/energy/mng/bi/meter_record/page`, {
    method: 'POST',
    data,
  });
}
/** 查询能源分项分布汇总 */
export async function getInsTagCollect(data: Record<string, any>) {
  return simpleReq<ResultData<InsTagCollectType>['data']>(`/energy/mng/bi/ins_tag/collect`, {
    method: 'POST',
    data,
  });
}
/** 查询能源分项目用电分析柱状图 */
export async function getInsTagColumnar(data: Record<string, any>) {
  return simpleReq<ResultData<InsTagColumnarType>['data']>(`/energy/mng/bi/ins_tag/columnar`, {
    method: 'POST',
    data,
  });
}
/** 分页查询主从分析 目前只按照天维度查询 */
export async function insTreePage(data: Record<string, any>) {
  return simpleReq<ResultPageData<InsTreePageType>['data']>(`/energy/mng/bi/ins_tree/page`, {
    method: 'POST',
    data,
  });
}
/** 单个主表用能分析 */
export async function insTreeDetailById(data: Record<string, any>) {
  return simpleReq<ResultData<InsTreeDetailType>['data']>(`/energy/mng/bi/ins_tree/${data.id}`, {
    method: 'POST',
    data,
  });
}
/** 查询周期内仪表趋势 */
export async function meterRecordDetail(data: Record<string, any>) {
  return simpleReq<ResultData<MeterRecordDetailType>['data']>(
    `/energy/mng/bi/meter_record/detail`,
    {
      method: 'POST',
      data,
    },
  );
}
/** 分页查询仪表状态 */
export async function getInsStatePage(params: Record<string, any>) {
  return simpleReq<ResultPageData<InsStatePageType>['data']>(
    `/energy/mng/ins/state/page/${params.insId}`,
    {
      method: 'GET',
      params,
    },
  );
}
